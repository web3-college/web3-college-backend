import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class VideoPartDto {
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

  @ApiProperty({ 
    description: '分片编号', 
    example: 1 
  })
  @IsNotEmpty()
  @IsNumber()
  partNumber: number;

  @ApiProperty({ 
    type: 'string', 
    format: 'binary', 
    description: '分片文件' 
  })
  file: any;
} 