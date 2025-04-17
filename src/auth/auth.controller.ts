import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  UnauthorizedException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request } from 'express';
import { VerifySignatureDto } from './dto/verify-signature.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiResponse,
} from '@nestjs/swagger';
import { apiSimpleResponse, apiInlineResponse } from '../common/models/swagger.model';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
  ) { }

  @ApiOperation({ summary: '获取随机Nonce', description: '用于SIWE签名过程，返回一个随机字符串' })
  @ApiOkResponse(apiInlineResponse({
    nonce: { type: 'string', example: 'a1b2c3d4e5f6' }
  }, '成功获取Nonce'))
  @Get('nonce')
  async getNonce(@Req() request: Request) {
    const nonce = this.authService.getNonce();
    console.log('getNonce', nonce);
    request.session.nonce = nonce;
    return new Promise((resolve) => {
      request.session.save(() => {
        resolve({ nonce });
      });
    });
  }

  @ApiOperation({
    summary: '验证SIWE签名',
    description: '验证以太坊钱包签名'
  })
  @ApiBody({ type: VerifySignatureDto })
  @ApiOkResponse(apiSimpleResponse(true, '认证成功'))
  @ApiResponse(apiInlineResponse({
    status: { type: 'number', example: 422 },
    message: { type: 'string', example: 'Invalid signature' }
  }, '签名验证失败', 422))
  @Post('verify')
  async verifySignature(
    @Body() verifySignatureDto: VerifySignatureDto,
    @Req() request: Request,
  ) {
    try {
      if (!verifySignatureDto.message) {
        return { status: 422, message: 'Expected message object in body.' };
      }
      const nonce = request.session.nonce;
      console.log('verify', nonce);
      const { fields, id } =
        await this.authService.verifySignature(
          verifySignatureDto.message,
          verifySignatureDto.signature,
          nonce,
        );

      request.session.siwe = fields.data;
      request.session.userId = id;
      if (fields.data.expirationTime) {
        request.session.cookie.expires = new Date(fields.data.expirationTime);
      }

      // 保存会话并返回认证结果
      return new Promise((resolve) => {
        request.session.save(() => {
          resolve(true);
        });
      });
    } catch (error) {
      // 清除会话数据
      request.session.siwe = null;
      request.session.nonce = null;

      console.error(error);

      // 根据错误类型返回不同的状态码
      let status = 500;
      if (error.message.includes('expired')) {
        status = 440;
      } else if (error.message.includes('signature')) {
        status = 422;
      }

      return new Promise((resolve) => {
        request.session.save(() => {
          resolve({
            status,
            message: error.message,
          });
        });
      });
    }
  }

  @ApiOperation({
    summary: '获取当前登录用户信息',
    description: '从会话中获取用户信息'
  })
  @ApiOkResponse(apiInlineResponse({
    address: { type: 'string', example: '0x1234567890abcdef1234567890abcdef12345678' },
    chainId: { type: 'number', example: 1 }
  }, '用户已登录'))
  @ApiUnauthorizedResponse(apiInlineResponse({
    authenticated: { type: 'boolean', example: false },
    message: { type: 'string', example: '未登录' }
  }, '用户未登录', HttpStatus.UNAUTHORIZED))
  @Get('session')
  async getUserInfo(@Req() request: Request) {
    try {
      // 检查会话中是否有 SIWE 数据
      if (request.session?.siwe) {
        const siweData = request.session.siwe;

        // 检查 SIWE 数据是否过期
        if (
          siweData.expirationTime &&
          new Date(siweData.expirationTime) < new Date()
        ) {
          // SIWE 数据已过期，清除会话
          request.session.siwe = null;
          request.session.nonce = null;
          await new Promise((resolve) => request.session.save(resolve));

          throw new UnauthorizedException('登录已过期，请重新登录');
        }

        return {
          address: siweData.address,
          chainId: siweData.chainId,
        };
      }
      throw new UnauthorizedException('未登录');
    } catch (error) {
      return {
        authenticated: false,
        message: error.message || '未登录',
      };
    }
  }

  @ApiOperation({
    summary: '用户登出',
    description: '清除用户会话和认证信息'
  })
  @ApiOkResponse(apiInlineResponse({
    success: { type: 'boolean', example: true },
    message: { type: 'string', example: '已成功登出' }
  }, '登出成功'))
  @Get('logout')
  async logout(@Req() request: Request) {
    try {
      // 清除会话中的 SIWE 数据和 nonce
      request.session.siwe = null;
      request.session.nonce = null;

      // 销毁整个会话
      return new Promise((resolve) => {
        request.session.destroy((err) => {
          if (err) {
            console.error('销毁会话时出错:', err);
            resolve({
              success: false,
              message: '登出失败',
            });
          } else {
            resolve({
              success: true,
              message: '已成功登出',
            });
          }
        });
      });
    } catch (error) {
      console.error('登出过程中出错:', error);
      return {
        success: false,
        message: '登出过程中发生错误',
      };
    }
  }

  @ApiOperation({
    summary: '检查用户是否有后台权限',
    description: '检查当前登录用户是否拥有后台管理权限（角色包含super、admin或manager）'
  })
  @ApiOkResponse(apiInlineResponse({
    hasAccess: { type: 'boolean', example: true }
  }, '权限检查成功'))
  @ApiUnauthorizedResponse(apiInlineResponse({
    authenticated: { type: 'boolean', example: false },
    message: { type: 'string', example: '未登录' }
  }, '用户未登录', HttpStatus.UNAUTHORIZED))
  @Get('isAdmin')
  async isAdmin(@Req() request: Request) {
    try {
      // 检查用户是否已登录
      if (!request.session?.siwe) {
        throw new UnauthorizedException('未登录');
      }

      const siweData = request.session.siwe;
      return this.authService.isAdmin(siweData.address);
    } catch (error) {
      return {
        hasAccess: false,
        message: error.message || '未登录',
      };
    }
  }
}
