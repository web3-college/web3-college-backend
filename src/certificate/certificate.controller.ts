import { Controller, Get, Post, Put, Body, Query, Req } from '@nestjs/common';
import { CertificateService } from './certificate.service';
import { CreateCertificateRequestDto, UpdateCertificateStatusDto } from './dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { RolePermissionGuard } from '@/common/guards/role-permission.guard';
import { Permission, Create, Read, Update } from '@/common/decorators/role-permission.decorator';
import { Request } from 'express';
import { CertificateStatus } from 'prisma/client/postgresql';

@ApiTags('certificate')
@UseGuards(RolePermissionGuard)
@Permission('certificate')
@Controller('certificate')
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) { }

  // 创建证书请求
  @Post('request')
  @ApiOperation({ summary: '创建证书请求' })
  @ApiBody({ type: CreateCertificateRequestDto })
  @ApiResponse({ status: 201, description: '证书请求创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误或不满足申请条件' })
  @ApiResponse({ status: 401, description: '用户未登录' })
  @ApiResponse({ status: 404, description: '课程不存在' })
  @Create()
  async createCertificateRequest(
    @Body() createCertificateRequestDto: CreateCertificateRequestDto,
    @Req() request: Request
  ) {
    // 从会话中获取用户ID和地址
    if (!request.session.siwe) {
      throw new Error('用户未登录');
    }

    const userId = request.session.userId;
    const address = request.session.siwe.address;
    return this.certificateService.createCertificateRequest(userId, address, createCertificateRequestDto);
  }

  // 更新证书请求状态（仅超级管理员可用）
  @Put('status')
  @ApiOperation({ summary: '更新证书请求状态' })
  @ApiBody({ type: UpdateCertificateStatusDto })
  @ApiResponse({ status: 200, description: '证书状态更新成功' })
  @ApiResponse({ status: 404, description: '证书请求不存在' })
  @Update()
  async updateCertificateStatus(@Body() updateCertificateStatusDto: UpdateCertificateStatusDto) {
    return this.certificateService.updateCertificateStatus(updateCertificateStatusDto);
  }

  // 获取用户的所有证书请求
  @Get('user')
  @ApiOperation({ summary: '获取用户的所有证书请求' })
  @ApiResponse({ status: 200, description: '获取证书请求列表成功' })
  @Read()
  async getUserCertificateRequests(@Req() request: Request) {
    if (!request.session.siwe) {
      throw new Error('用户未登录');
    }

    const userId = request.session.userId;
    return this.certificateService.getUserCertificateRequests(userId);
  }

  // 获取所有证书请求（管理员使用）
  @Get('all')
  @ApiOperation({ summary: '获取所有证书请求' })
  @ApiQuery({ name: 'status', required: false, enum: CertificateStatus, description: '证书状态过滤' })
  @ApiQuery({ name: 'address', required: false, description: '用户钱包地址过滤' })
  @ApiQuery({ name: 'page', required: false, description: '页码，默认为1' })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页数量，默认为10' })
  @ApiResponse({ status: 200, description: '获取证书请求列表成功' })
  @Read()
  async getAllCertificateRequests(
    @Query('status') status?: CertificateStatus,
    @Query('address') address?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number
  ) {
    return this.certificateService.getAllCertificateRequests(
      status,
      address,
      page ? Number(page) : 1,
      pageSize ? Number(pageSize) : 10
    );
  }
} 