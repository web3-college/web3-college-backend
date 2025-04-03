import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, CreateMultipartUploadCommand, UploadPartCommand, ListPartsCommand, CompleteMultipartUploadCommand, AbortMultipartUploadCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { UploadedFile, UploadResult, MultipartUploadInit, PartUploadResult, CompleteUploadResult, FileCheckResult } from './interfaces';
import { calculateMd5MultiThread } from '../utils/md5-utils';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private s3Client: S3Client;
  private bucket: string;
  private region: string;

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.region = this.configService.get('AWS_S3_REGION');
    this.bucket = this.configService.get('AWS_S3_BUCKET_NAME');
    
    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get('AWS_S3_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_S3_SECRET_ACCESS_KEY'),
      },
    });
  }

  async checkFileExists(file: UploadedFile): Promise<FileCheckResult> {
    try {
      const fileHash = await calculateMd5MultiThread(file.buffer);
      const key = `${fileHash}`;
      
      // 尝试获取文件元数据
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      try {
        await this.s3Client.send(command);
        // 文件存在，返回URL
        return {
          exists: true,
          fileHash,
          url: `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`
        };
      } catch (error) {
        if (error.name === 'NotFound') {
          // 确定文件不存在
          return { exists: false, fileHash };
        }
        throw error
      }
    } catch (error) {
      throw error
    }
  }

  /**
   * 上传图片到 S3
   * @param file 图片文件
   * @returns 图片URL和相关信息
   */
  async uploadImage(file: UploadedFile): Promise<UploadResult> {
    try {
      // 验证是否为图片
      if (!file.mimetype.includes('image/')) {
        throw new BadRequestException('文件类型必须是图片');
      }
      const { exists, fileHash, url } = await this.checkFileExists(file);
      const key = `${fileHash}`;
      if (exists) {
        return {
          url,
          key,
          fileName: file.originalname
        };
      }

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        // 设置额外的元数据
        Metadata: {
          'original-name': encodeURIComponent(file.originalname),
          'upload-date': new Date().toISOString(),
        },
      });

      await this.s3Client.send(command);

      return {
        url: `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`,
        key,
        fileName: file.originalname
      };
    } catch (error) {
      this.logger.error(`上传图片失败: ${error.message}`, error.stack);
      throw new BadRequestException(`上传图片失败: ${error.message}`);
    }
  }

  /**
   * 上传视频（小文件，10MB以下）- 单次上传
   * @param file 视频文件
   * @returns 视频URL和相关信息
   */
  async uploadSmallVideo(file: UploadedFile): Promise<UploadResult> {
    try {
      // 验证是否为视频
      if (!file.mimetype.includes('video/')) {
        throw new BadRequestException('文件类型必须是视频');
      }

      const { exists, fileHash, url } = await this.checkFileExists(file);
      const key = `${fileHash}`;
      if (exists) {
        return {
          url,
          key,
          fileName: file.originalname
        };
      }

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
          'original-name': encodeURIComponent(file.originalname),
          'upload-date': new Date().toISOString(),
        },
      });

      await this.s3Client.send(command);

      return {
        url: `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`,
        key,
        fileName: file.originalname
      };
    } catch (error) {
      this.logger.error(`上传视频失败: ${error.message}`, error.stack);
      throw new BadRequestException(`上传视频失败: ${error.message}`);
    }
  }

  /**
   * 视频上传 - 初始化分片上传（大文件）
   * AWS S3分片上传有效期为7天，超时后会自动中止上传
   * @param file 视频文件
   * @returns 上传ID和相关信息
   */
  async initiateMultipartUpload(file: UploadedFile): Promise<MultipartUploadInit> {
    try {
      // 验证是否为视频
      if (!file.mimetype.includes('video/')) {
        throw new BadRequestException('内容类型必须是视频');
      }

      const { exists, fileHash, url } = await this.checkFileExists(file);
      const key = `${fileHash}`;
      if (exists) {
        return {
          url,
          key,
          fileName: file.originalname,
          expiration: null // 如果文件已存在，不需要考虑过期时间
        };
      }
      
      // 设置过期时间为7天后
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 7);
      
      const command = new CreateMultipartUploadCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: file.mimetype,
        Metadata: {
          'original-name': encodeURIComponent(file.originalname),
          'upload-date': new Date().toISOString(),
          'expiration-date': expirationDate.toISOString(),
        },
      });

      const response = await this.s3Client.send(command);

      if (!response.UploadId) {
        throw new BadRequestException('初始化分片上传失败，未获取上传ID');
      }

      return {
        uploadId: response.UploadId,
        key,
        fileName: file.originalname,
        expiration: expirationDate.toISOString() // 返回过期时间给前端
      };
    } catch (error) {
      this.logger.error(`初始化视频分片上传失败: ${error.message}`, error.stack);
      throw new BadRequestException(`初始化视频分片上传失败: ${error.message}`);
    }
  }

  /**
   * 视频上传 - 上传分片
   * @param key 文件键
   * @param uploadId 上传ID
   * @param partNumber 分片编号
   * @param file 分片文件
   * @returns 分片上传结果
   */
  async uploadPart(key: string, uploadId: string, partNumber: number, file: UploadedFile): Promise<PartUploadResult> {
    try {
      if (!key || !uploadId || !partNumber || partNumber < 1) {
        throw new BadRequestException('无效的分片上传参数');
      }

      const command = new UploadPartCommand({
        Bucket: this.bucket,
        Key: key,
        UploadId: uploadId,
        PartNumber: partNumber,
        Body: file.buffer,
      });

      const response = await this.s3Client.send(command);

      if (!response.ETag) {
        throw new BadRequestException('上传分片时未获取ETag');
      }

      return {
        ETag: response.ETag,
        PartNumber: partNumber
      };
    } catch (error) {
      this.logger.error(`上传视频分片失败: ${error.message}`, error.stack);
      throw new BadRequestException(`上传视频分片失败: ${error.message}`);
    }
  }

  /**
   * 视频上传 - 列出已上传的分片
   * @param key 文件键
   * @param uploadId 上传ID
   * @returns 分片列表
   */
  async listParts(key: string, uploadId: string) {
    try {
      if (!key || !uploadId) {
        throw new BadRequestException('无效的参数');
      }

      const command = new ListPartsCommand({
        Bucket: this.bucket,
        Key: key,
        UploadId: uploadId,
      });

      const response = await this.s3Client.send(command);
      return response.Parts || [];
    } catch (error) {
      this.logger.error(`列出视频分片失败: ${error.message}`, error.stack);
      throw new BadRequestException(`列出视频分片失败: ${error.message}`);
    }
  }

  /**
   * 视频上传 - 完成分片上传
   * @param key 文件键
   * @param uploadId 上传ID
   * @param parts 分片信息
   * @returns 完成上传结果
   */
  async completeMultipartUpload(
    key: string, 
    uploadId: string, 
    parts: Array<{ ETag: string, PartNumber: number }>
  ): Promise<CompleteUploadResult> {
    try {
      if (!key || !uploadId || !parts || parts.length === 0) {
        throw new BadRequestException('无效的参数');
      }

      // 按照分片编号排序
      parts.sort((a, b) => a.PartNumber - b.PartNumber);

      const command = new CompleteMultipartUploadCommand({
        Bucket: this.bucket,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: parts.map(part => ({
            ETag: part.ETag,
            PartNumber: part.PartNumber
          }))
        }
      });

      await this.s3Client.send(command);

      return {
        url: `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`,
        key
      };
    } catch (error) {
      this.logger.error(`完成视频上传失败: ${error.message}`, error.stack);
      throw new BadRequestException(`完成视频上传失败: ${error.message}`);
    }
  }

  /**
   * 视频上传 - 取消分片上传
   * @param key 文件键
   * @param uploadId 上传ID
   * @returns 取消上传结果
   */
  async abortMultipartUpload(key: string, uploadId: string) {
    try {
      if (!key || !uploadId) {
        throw new BadRequestException('无效的参数');
      }

      const command = new AbortMultipartUploadCommand({
        Bucket: this.bucket,
        Key: key,
        UploadId: uploadId
      });

      await this.s3Client.send(command);
      return { message: '取消视频上传成功' };
    } catch (error) {
      this.logger.error(`取消视频上传失败: ${error.message}`, error.stack);
      throw new BadRequestException(`取消视频上传失败: ${error.message}`);
    }
  }
} 