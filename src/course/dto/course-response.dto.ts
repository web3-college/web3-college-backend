import { ApiProperty } from '@nestjs/swagger';
import { Category, Course, CourseSection } from 'prisma/client/postgresql';

export class CourseResponseDto implements Course {
  @ApiProperty({
    description: '课程ID',
    example: 1
  })
  id: number;

  @ApiProperty({
    description: '课程名称',
    example: 'Web3开发入门'
  })
  name: string;

  @ApiProperty({
    description: '课程描述',
    example: 'Web3区块链开发入门课程'
  })
  description: string;

  @ApiProperty({
    description: '课程封面图',
    example: 'https://example.com/cover.jpg'
  })
  coverImage: string;

  @ApiProperty({
    description: '课程价格',
    example: 100
  })
  price: number;

  @ApiProperty({
    description: '创建者',
    example: '0x1234567890abcdef'
  })
  creator: string;

  @ApiProperty({
    description: '创建时间',
    example: '2021-01-01'
  })
  createdAt: Date;

  @ApiProperty({
    description: '更新时间',
    example: '2021-01-01'
  })
  updatedAt: Date;

  @ApiProperty({
    description: '是否激活',
    example: true
  })
  isActive: boolean;

  @ApiProperty({
    description: '链上ID',
    example: 1
  })
  onChainId: number;

  @ApiProperty({
    description: '课程分类ID',
    example: 1
  })
  categoryId: number;

  @ApiProperty({
    description: '课程分类',
    example: 'Web3开发'
  })
  category: Category;

  @ApiProperty({
    description: '课程章节',
    example: 'Web3开发'
  })
  sections: CourseSection[];
  // 其他课程属性...
}

export class CourseListResponseDto {
  @ApiProperty({
    description: '课程列表',
    type: [Object]
  })
  items: Partial<Course>[];

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

  @ApiProperty({
    description: '总页数',
    example: 10
  })
  totalPages: number;
} 