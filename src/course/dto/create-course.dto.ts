import { IsNotEmpty, IsString, IsNumber, IsOptional, IsBoolean, IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateCourseSectionDto } from './create-course-section.dto';

export class CreateCourseDto {
  @ApiProperty({ description: '课程名称', example: 'Web3开发入门' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '课程描述', example: '从零开始学习Web3开发技术' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '课程封面图片URL', example: 'https://example.com/images/course-cover.jpg' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiProperty({ description: '课程价格（代币数量）', example: 100 })
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @ApiProperty({ description: '创建者钱包地址', example: '0x1234567890abcdef1234567890abcdef12345678' })
  @IsNotEmpty()
  @IsString()
  creator: string;

  @ApiPropertyOptional({ description: '课程是否激活', default: true, example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @ApiPropertyOptional({ description: '链上课程ID', example: 42 })
  @IsOptional()
  @IsNumber()
  onChainId?: number;
  
  @ApiPropertyOptional({ description: '课程分类ID', example: 1 })
  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @ApiPropertyOptional({ 
    description: '课程章节列表', 
    type: [CreateCourseSectionDto],
    example: [
      {
        title: '第一章：Web3简介',
        description: '了解Web3的基本概念',
        videoUrl: 'https://example.com/videos/web3-basics.mp4',
        order: 1
      },
      {
        title: '第二章：区块链基础',
        description: '学习区块链的核心原理',
        videoUrl: 'https://example.com/videos/blockchain-basics.mp4',
        order: 2
      }
    ]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(0)
  @Type(() => CreateCourseSectionDto)
  sections?: CreateCourseSectionDto[];
} 