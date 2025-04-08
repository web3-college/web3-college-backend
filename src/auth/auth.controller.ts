import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request } from 'express';
import { VerifySignatureDto } from './dto/verify-signature.dto';
import { UsersService } from '@/users/users.service';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  @Get('nonce')
  async getNonce(@Req() request: Request) {
    const nonce = this.authService.getNonce();
    console.log('getNonce', nonce);
    request.session.nonce = nonce;
    return { nonce };
  }

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
      const { fields, access_token, user } =
        await this.authService.verifySignature(
          verifySignatureDto.message,
          verifySignatureDto.signature,
          nonce,
        );

      request.session.siwe = fields.data;

      if (fields.data.expirationTime) {
        request.session.cookie.expires = new Date(fields.data.expirationTime);
      }

      // 保存会话并返回认证结果
      return new Promise((resolve) => {
        request.session.save(() => {
          resolve({
            authenticated: true,
            access_token: access_token,
            user: user,
          });
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

        // 获取用户信息
        const user = await this.usersService.findByAddress(siweData.address);

        if (!user) {
          throw new UnauthorizedException('用户不存在');
        }

        // 生成新的 JWT 令牌
        const payload = {
          sub: user.id,
          address: user.address,
        };

        return {
          authenticated: true,
          user: user,
          access_token: this.jwtService.sign(payload),
        };
      }

      // 如果没有 SIWE 数据，尝试从 Authorization 头部获取 JWT
      // const authHeader = request.headers.authorization;
      // if (authHeader && authHeader.startsWith('Bearer ')) {
      //   const token = authHeader.substring(7);

      //   try {
      //     const payload = this.jwtService.verify(token);
      //     const user = await this.usersService.findById(payload.sub);

      //     if (!user) {
      //       throw new UnauthorizedException('用户不存在');
      //     }

      //     return {
      //       authenticated: true,
      //       user: user,
      //       access_token: token, // 返回原始令牌
      //     };
      //   } catch (error) {
      //     throw new UnauthorizedException('令牌无效或已过期');
      //   }
      // }

      // 如果既没有会话数据也没有有效的 JWT，则返回未认证状态
      throw new UnauthorizedException('未登录');
    } catch (error) {
      return {
        authenticated: false,
        message: error.message || '未登录',
      };
    }
  }

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
}
