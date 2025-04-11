import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class SavePurchaseRecordDto {
  @ApiProperty({
    description: '用户ID',
    example: 1
  })
  @IsNotEmpty({ message: '用户ID不能为空' })
  @IsNumber({}, { message: '用户ID必须是数字' })
  userId: number;

  @ApiProperty({
    description: '课程ID',
    example: 1
  })
  @IsNotEmpty({ message: '课程ID不能为空' })
  @IsNumber({}, { message: '课程ID必须是数字' })
  courseId: number;

  @ApiProperty({
    description: '交易哈希',
    example: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
  })
  @IsOptional()
  @IsString({ message: '交易哈希必须是字符串' })
  txHash?: string;

  @ApiProperty({
    description: '链上状态验证',
    example: false,
    default: false
  })
  @IsOptional()
  @IsBoolean({ message: '链上状态验证必须是布尔值' })
  onChainStatus?: boolean = false;
} 