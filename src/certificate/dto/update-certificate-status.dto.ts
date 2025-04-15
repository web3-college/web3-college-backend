import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsEnum, IsOptional } from 'class-validator';

export enum CertificateStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ISSUED = 'ISSUED'
}

export class UpdateCertificateStatusDto {
  @ApiProperty({
    description: '证书请求ID',
    example: 1
  })
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @ApiProperty({
    description: '证书状态',
    example: 'APPROVED',
    enum: CertificateStatus
  })
  @IsNotEmpty()
  @IsEnum(CertificateStatus)
  status: CertificateStatus;

  @ApiProperty({
    description: '反馈信息',
    example: '恭喜你获得证书！',
    required: false
  })
  @IsOptional()
  @IsString()
  feedback?: string;
} 