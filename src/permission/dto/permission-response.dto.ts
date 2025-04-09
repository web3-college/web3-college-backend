import { ApiProperty } from '@nestjs/swagger';

export class PermissionResponseDto {
  @ApiProperty({
    description: '权限ID',
    example: 1
  })
  id: number;

  @ApiProperty({
    description: '权限名称',
    example: 'create:course'
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

export class PermissionListResponseDto {
  @ApiProperty({
    description: '权限列表',
    type: [PermissionResponseDto]
  })
  items: PermissionResponseDto[];

  @ApiProperty({
    description: '总记录数',
    example: 100
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