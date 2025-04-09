import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: '用户ID',
    example: 1
  })
  id: number;

  @ApiProperty({
    description: '用户地址',
    example: '0x1234567890abcdef1234567890abcdef12345678'
  })
  address: string;

  @ApiProperty({
    description: '用户名称',
    example: 'JohnDoe',
    nullable: true
  })
  name: string | null;

  @ApiProperty({
    description: '用户邮箱',
    example: 'john@example.com',
    nullable: true
  })
  email: string | null;

  @ApiProperty({
    description: '用户头像',
    example: 'https://example.com/avatar.jpg',
    nullable: true
  })
  avatar: string | null;

  @ApiProperty({
    description: '用户简介',
    example: 'Web3爱好者',
    nullable: true
  })
  bio: string | null;

  @ApiProperty({
    description: '创建时间',
    example: '2021-01-01T00:00:00.000Z',
    nullable: true
  })
  createdAt: Date | null;

  @ApiProperty({
    description: '用户角色',
    type: [Object],
  })
  roles: any[];
}

export class UserListResponseDto {
  @ApiProperty({
    description: '用户列表',
    type: [UserResponseDto]
  })
  items: UserResponseDto[];

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