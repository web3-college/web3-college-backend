import { ApiProperty } from '@nestjs/swagger';

export class PermissionInfo {
  @ApiProperty({
    description: '权限ID',
    example: 1
  })
  id: number;

  @ApiProperty({
    description: '权限名称',
    example: 'course:create'
  })
  name: string;

  @ApiProperty({
    description: '权限操作',
    example: 'create'
  })
  action: string;

  @ApiProperty({
    description: '权限描述',
    example: '创建课程的权限',
    nullable: true
  })
  description: string | null;
}

export class RoleResponseDto {
  @ApiProperty({
    description: '角色ID',
    example: 1
  })
  id: number;

  @ApiProperty({
    description: '角色名称',
    example: 'admin'
  })
  name: string;

  @ApiProperty({
    description: '角色描述',
    example: '系统管理员',
    nullable: true
  })
  description: string | null;

  @ApiProperty({
    description: '角色权限',
    type: [PermissionInfo],
    required: false
  })
  permissions?: PermissionInfo[];
}

export class RoleListResponseDto {
  @ApiProperty({
    description: '角色列表',
    type: [RoleResponseDto]
  })
  items: RoleResponseDto[];

  @ApiProperty({
    description: '总记录数',
    example: 5
  })
  total: number;

  @ApiProperty({
    description: '当前页码',
    example: 1
  })
  page: number;

  @ApiProperty({
    description: '每页数量',
    example: 10
  })
  pageSize: number;
} 