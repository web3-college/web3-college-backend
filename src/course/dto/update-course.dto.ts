import { IsOptional, IsString, IsNumber, IsBoolean, IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UpdateCourseSectionDto } from './update-course-section.dto';

export class UpdateCourseDto {
  @ApiPropertyOptional({ description: '课程名称', example: '更新后的Web3开发入门' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '课程描述', example: '更新后的课程描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '课程封面图片URL', example: 'https://example.com/images/updated-cover.jpg' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({ description: '课程价格（代币数量）', example: 150 })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional({ description: '创建者钱包地址', example: '0x1234567890abcdef1234567890abcdef12345678' })
  @IsOptional()
  @IsString()
  creator?: string;

  @ApiPropertyOptional({ description: '课程是否激活', example: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: '链上课程ID', example: 42 })
  @IsOptional()
  @IsNumber()
  onChainId?: number;

  @ApiPropertyOptional({ description: '课程分类ID', example: 2 })
  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @ApiPropertyOptional({ 
    description: '课程章节列表', 
    type: [UpdateCourseSectionDto],
    example: [
      {
        id: 1,
        title: '更新后的章节标题',
        description: '更新后的章节描述',
        order: 1
      },
      {
        title: '新添加的章节',
        description: '这是一个新章节',
        order: 2
      }
    ]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(0)
  @Type(() => UpdateCourseSectionDto)
  sections?: UpdateCourseSectionDto[];
}
