import { IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCourseSectionDto {
  @ApiPropertyOptional({ description: '章节ID（更新现有章节时需要提供）', example: 1 })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiPropertyOptional({ description: '章节标题', example: '更新后的Web3基础概念' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: '章节描述', example: '更新后的章节描述内容' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '章节排序', example: 2 })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional({ description: '视频URL', example: 'https://example.com/videos/updated-web3-basics.mp4' })
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
