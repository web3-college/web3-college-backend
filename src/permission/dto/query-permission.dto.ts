import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { BaseQueryDto } from '../../../src/common/dto/base-query.dto';

export class QueryPermissionDto extends BaseQueryDto {
  @ApiProperty({
    description: '权限名称',
    example: 'course',
    required: false
  })
  @IsOptional()
  @IsString({ message: '权限名称必须是字符串' })
  name?: string;

  @ApiProperty({
    description: '权限操作',
    example: 'create',
    required: false
  })
  @IsOptional()
  @IsString({ message: '权限操作必须是字符串' })
  action?: string;
} 