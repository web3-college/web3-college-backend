import { 
  Controller, 
  Post, 
  UseInterceptors, 
  UploadedFile,
  Body,
  BadRequestException,
  Get,
  Query
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { UploadResult, MultipartUploadInit, PartUploadResult, CompleteUploadResult } from './interfaces';
import { Express } from 'express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { UploadFileDto } from './dto/upload-file.dto';
import { VideoPartDto } from './dto/video-part.dto';
import { CompleteUploadDto } from './dto/complete-upload.dto';
import { AbortUploadDto } from './dto/abort-upload.dto';

@ApiTags('upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  // 检查文件是否已存在
  @Post('check')
  @ApiOperation({ summary: '检查文件是否已存在', description: '通过MD5检查文件是否已上传过，若存在则返回文件URL' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadFileDto })
  @ApiResponse({ status: 200, description: '文件检查结果' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @UseInterceptors(FileInterceptor('file'))
  async checkFileExists(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('未找到文件');
    }

    return this.uploadService.checkFileExists(file);
  }

  // ----- 图片上传接口 -----
  @Post('image')
  @ApiOperation({ summary: '上传图片', description: '上传图片文件，返回访问URL' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadFileDto })
  @ApiResponse({ status: 200, description: '图片上传成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException('未找到文件');
    }

    return this.uploadService.uploadImage(file);
  }

  // ----- 小视频上传接口 -----
  @Post('video/small')
  @ApiOperation({ summary: '上传小视频', description: '上传10MB以下的小视频文件' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadFileDto })
  @ApiResponse({ status: 200, description: '视频上传成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadSmallVideo(@UploadedFile() file: Express.Multer.File): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException('未找到文件');
    }

    return this.uploadService.uploadSmallVideo(file);
  }

  // ----- 大视频分片上传接口组 -----
  
  // 1. 初始化视频上传
  @Post('video/init')
  @ApiOperation({ summary: '初始化视频上传', description: '创建一个分片上传任务，获取uploadId' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadFileDto })
  @ApiResponse({ status: 200, description: '初始化上传成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @UseInterceptors(FileInterceptor('file'))
  async initiateVideoUpload(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<MultipartUploadInit> {
    if (!file) {
      throw new BadRequestException('未找到文件');
    }
    
    return this.uploadService.initiateMultipartUpload(file);
  }

  // 2. 上传视频分片
  @Post('video/part')
  @ApiOperation({ summary: '上传视频分片', description: '上传一个视频分片' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: VideoPartDto })
  @ApiResponse({ status: 200, description: '分片上传成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadVideoPart(
    @Body('key') key: string,
    @Body('uploadId') uploadId: string,
    @Body('partNumber') partNumber: number,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<PartUploadResult> {
    
    if (!key || !uploadId || !partNumber || !file) {
      throw new BadRequestException('参数不完整');
    }

    return this.uploadService.uploadPart(key, uploadId, +partNumber, file);
  }

  // 3. 获取已上传的分片列表
  @Get('video/parts')
  @ApiOperation({ summary: '获取已上传的分片列表', description: '获取指定上传任务的所有已上传分片' })
  @ApiQuery({ name: 'key', description: '文件S3 Key', required: true, type: String })
  @ApiQuery({ name: 'uploadId', description: '上传ID', required: true, type: String })
  @ApiResponse({ status: 200, description: '分片列表获取成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async listParts(
    @Query('key') key: string,
    @Query('uploadId') uploadId: string,
  ) {
    if (!key || !uploadId) {
      throw new BadRequestException('参数不完整');
    }

    return this.uploadService.listParts(key, uploadId);
  }

  // 4. 完成视频上传
  @Post('video/complete')
  @ApiOperation({ summary: '完成视频上传', description: '合并所有分片，完成整个视频的上传' })
  @ApiBody({ type: CompleteUploadDto })
  @ApiResponse({ status: 200, description: '视频上传完成' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async completeVideoUpload(
    @Body('key') key: string,
    @Body('uploadId') uploadId: string,
    @Body('parts') parts: Array<{ ETag: string, PartNumber: number }>,
  ): Promise<CompleteUploadResult> {
    if (!key || !uploadId || !parts || !parts.length) {
      throw new BadRequestException('参数不完整');
    }

    return this.uploadService.completeMultipartUpload(key, uploadId, parts);
  }

  // 5. 取消视频上传
  @Post('video/abort')
  @ApiOperation({ summary: '取消视频上传', description: '取消分片上传任务并删除所有已上传分片' })
  @ApiBody({ type: AbortUploadDto })
  @ApiResponse({ status: 200, description: '上传任务取消成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async abortVideoUpload(
    @Body('key') key: string,
    @Body('uploadId') uploadId: string,
  ) {
    if (!key || !uploadId) {
      throw new BadRequestException('参数不完整');
    }

    return this.uploadService.abortMultipartUpload(key, uploadId);
  }
} 