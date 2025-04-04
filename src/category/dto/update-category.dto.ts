import { IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCategoryDto {
  @ApiPropertyOptional({ description: '分类名称', example: '更新后的Web3基础' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '分类描述', example: '更新后的分类描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '分类图标', example: 'updated-web3-icon' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ description: '分类排序', example: 2 })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional({ description: '分类是否激活', example: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
} 