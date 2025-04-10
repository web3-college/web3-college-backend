import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { BaseQueryDto } from '@/common/dto/base-query.dto';

export class QueryCategoryDto extends BaseQueryDto {
  @ApiProperty({
    description: '分类名称',
    example: 'Web3',
    required: false
  })
  @IsOptional()
  @IsString({ message: '分类名称必须是字符串' })
  name?: string;

  @ApiProperty({
    description: '是否激活',
    example: true,
    required: false
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean({ message: '激活状态必须是布尔值' })
  isActive?: boolean;
}

export class QueryCategoryWithoutPaginationDto {
  @ApiProperty({
    description: '是否激活',
    example: true,
    required: false
  })
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsOptional()
  @IsBoolean({ message: '激活状态必须是布尔值' })
  isActive?: boolean;

  @ApiProperty({
    description: '分类名称',
    example: 'Web3',
    required: false
  })
  @IsOptional()
  @IsString({ message: '分类名称必须是字符串' })
  name?: string;
}