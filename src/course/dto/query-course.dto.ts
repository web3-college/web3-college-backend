import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { BaseQueryDto } from '../../../src/common/dto/base-query.dto';

export class QueryCourseDto extends BaseQueryDto {
  @ApiProperty({
    description: '课程名称',
    example: 'Web3开发入门',
    required: false
  })
  @IsOptional()
  @IsString({ message: '课程名称必须是字符串' })
  name?: string;

  @ApiProperty({
    description: '是否激活',
    example: true,
    required: false
  })
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: '分类ID',
    example: 1,
    required: false
  })
  @IsOptional()
  categoryId?: number;
} 