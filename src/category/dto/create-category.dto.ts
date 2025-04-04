import { IsNotEmpty, IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ description: '分类名称', example: 'Web3基础' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '分类描述', example: '包含Web3领域的基础知识课程' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '分类图标', example: 'web3-icon' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ description: '分类排序', default: 0, example: 1 })
  @IsOptional()
  @IsNumber()
  order?: number = 0;

  @ApiPropertyOptional({ description: '分类是否激活', default: true, example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
} 