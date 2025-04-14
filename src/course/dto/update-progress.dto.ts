import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';

export class UpdateProgressDto {
  @ApiProperty({
    description: '课程ID',
    example: 1
  })
  @IsNotEmpty()
  @IsNumber()
  courseId: number;

  @ApiProperty({
    description: '章节ID',
    example: 1
  })
  @IsNotEmpty()
  @IsNumber()
  sectionId: number;

  @ApiProperty({
    description: '学习进度 (0-100)',
    example: 75.5
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  progress: number;

  @ApiProperty({
    description: '最后观看位置（秒）',
    example: 360,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  lastPosition?: number;
} 