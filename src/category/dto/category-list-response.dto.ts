import { ApiProperty } from '@nestjs/swagger';
import { CategoryResponseDto } from './category-response.dto';

export class CategoryListResponseDto {
  @ApiProperty({
    description: '分类列表',
    type: [CategoryResponseDto]
  })
  items: CategoryResponseDto[];

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