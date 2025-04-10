import { ApiProperty } from '@nestjs/swagger';
import { Category } from 'prisma/client/postgresql';

export class CategoryResponseDto implements Category {
  @ApiProperty({ description: '分类ID', example: 1 })
  id: number;

  @ApiProperty({ description: '分类名称', example: 'Web3基础' })
  name: string;

  @ApiProperty({ description: '分类描述', example: '包含Web3领域的基础知识课程' })
  description: string;

  @ApiProperty({ description: '分类图标', example: 'web3-icon' })
  icon: string;

  @ApiProperty({ description: '分类排序', example: 1 })
  order: number;

  @ApiProperty({ description: '分类是否激活', example: true })
  isActive: boolean;

  @ApiProperty({ description: '创建时间', example: '2024-01-01 12:00:00' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间', example: '2024-01-01 12:00:00' })
  updatedAt: Date;
}
