import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateUserRolesDto {
  @ApiProperty({
    description: '角色ID列表',
    example: [1, 2],
    type: [Number],
  })
  @IsNotEmpty({ message: '角色ID列表不能为空' })
  @IsArray({ message: '角色ID必须是数组' })
  @IsInt({ each: true, message: '角色ID必须是整数' })
  @Type(() => Number)
  roleIds: number[];
} 