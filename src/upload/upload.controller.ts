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

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  // 检查文件是否已存在
  @Post('check')
  @UseInterceptors(FileInterceptor('file'))
  async checkFileExists(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('未找到文件');
    }

    return this.uploadService.checkFileExists(file);
  }

  // ----- 图片上传接口 -----
  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException('未找到文件');
    }

    return this.uploadService.uploadImage(file);
  }

  // ----- 小视频上传接口 -----
  @Post('video/small')
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