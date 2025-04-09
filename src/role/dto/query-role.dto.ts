import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { BaseQueryDto } from '../../../src/common/dto/base-query.dto';

export class QueryRoleDto extends BaseQueryDto {
  @ApiProperty({
    description: '角色名称',
    example: 'admin',
    required: false
  })
  @IsOptional()
  @IsString({ message: '角色名称必须是字符串' })
  name?: string;
} 