import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, IsOptional, IsArray, IsNumber } from 'class-validator';

export class UpdateRoleDto {
  @ApiProperty({
    description: '角色名称',
    example: 'admin',
    required: false
  })
  @IsOptional()
  @IsString({ message: '角色名称必须是字符串' })
  @MaxLength(50, { message: '角色名称不能超过50个字符' })
  name?: string;

  @ApiProperty({
    description: '角色描述',
    example: '系统管理员',
    required: false
  })
  @IsOptional()
  @IsString({ message: '角色描述必须是字符串' })
  @MaxLength(200, { message: '角色描述不能超过200个字符' })
  description?: string;

  @ApiProperty({
    description: '权限ID列表',
    example: [1, 2, 3],
    type: [Number],
    required: false
  })
  @IsOptional()
  @IsArray({ message: '权限ID列表必须是数组' })
  @IsNumber({}, { each: true, message: '权限ID必须是数字' })
  permissionIds?: number[];
} 