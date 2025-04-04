import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

class PartDetail {
  @ApiProperty({ description: 'ETag值', example: '"a54d88e06612d820bc3be723a5a158bb"' })
  @IsNotEmpty()
  @IsString()
  ETag: string;

  @ApiProperty({ description: '分片编号', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  PartNumber: number;
}

export class CompleteUploadDto {
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
    description: '已上传分片列表', 
    type: [PartDetail],
    example: [
      { ETag: '"a54d88e06612d820bc3be723a5a158bb"', PartNumber: 1 },
      { ETag: '"b54d88e06612d820bc3be723a5a158cc"', PartNumber: 2 },
    ]
  })
  @IsNotEmpty()
  @IsArray()
  @Type(() => PartDetail)
  parts: PartDetail[];
} 