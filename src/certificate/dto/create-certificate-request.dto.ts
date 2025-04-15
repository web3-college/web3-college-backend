import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateCertificateRequestDto {
  @ApiProperty({
    description: '课程ID',
    example: 1
  })
  @IsNotEmpty()
  @IsNumber()
  courseId: number;

  @ApiProperty({
    description: '备注信息',
    example: '我已完成所有章节，申请获取证书',
    required: false
  })
  @IsOptional()
  @IsString()
  notes?: string;
} 