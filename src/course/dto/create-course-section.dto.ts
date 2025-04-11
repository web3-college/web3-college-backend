import { IsNotEmpty, IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCourseSectionDto {
  @ApiProperty({ description: '章节标题', example: 'Web3基础概念' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: '章节描述', example: '介绍Web3的核心概念和应用场景' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '章节排序', example: 1 })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional({ description: '视频URL', example: 'https://example.com/videos/web3-basics.mp4' })
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiPropertyOptional({ description: '是否为预览章节', example: false })
  @IsOptional()
  @IsBoolean()
  isPreview?: boolean;

  @ApiPropertyOptional({ description: '视频时长', example: 120 })
  @IsOptional()
  @IsNumber()
  duration?: number;
}
