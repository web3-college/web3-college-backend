import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({
    description: '权限名称',
    example: 'create:course'
  })
  @IsNotEmpty({ message: '权限名称不能为空' })
  @IsString({ message: '权限名称必须是字符串' })
  @MaxLength(50, { message: '权限名称不能超过50个字符' })
  name: string;

  @ApiProperty({
    description: '权限操作',
    example: 'create'
  })
  @IsNotEmpty({ message: '权限操作不能为空' })
  @IsString({ message: '权限操作必须是字符串' })
  @MaxLength(50, { message: '权限操作不能超过50个字符' })
  action: string;

  @ApiProperty({
    description: '权限描述',
    example: '创建课程的权限',
    required: false
  })
  @IsString({ message: '权限描述必须是字符串' })
  @MaxLength(200, { message: '权限描述不能超过200个字符' })
  description?: string;
} 