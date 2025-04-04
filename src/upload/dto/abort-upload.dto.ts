import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AbortUploadDto {
  @ApiProperty({ 
    description: '文件S3 Key', 
    example: 'videos/1649084896543-ab12cd.mp4'
  })
  @IsNotEmpty()
  @IsString()
  key: string;

  @ApiProperty({ 
    description: '上传ID', 
    example: 'JzdWIiOiIxMjM0NTY3ODkwIiwibm'
  })
  @IsNotEmpty()
  @IsString()
  uploadId: string;
} 