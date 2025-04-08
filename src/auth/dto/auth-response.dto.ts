import { ApiProperty } from '@nestjs/swagger';

/**
 * Nonce响应
 */
export class NonceResponseDto {
  @ApiProperty({ example: 'a1b2c3d4e5f6' })
  nonce: string;
}

/**
 * 会话信息响应
 */
export class SessionResponseDto {
  @ApiProperty({ example: '0x1234567890abcdef1234567890abcdef12345678' })
  address: string;

  @ApiProperty({ example: 1 })
  chainId: number;
}

/**
 * 登出响应
 */
export class LogoutResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: '已成功登出' })
  message: string;
}

/**
 * 身份验证错误响应
 */
export class AuthErrorResponseDto {
  @ApiProperty({ example: false })
  authenticated: boolean;

  @ApiProperty({ example: '未登录' })
  message: string;
}

/**
 * 签名验证错误响应
 */
export class SignatureErrorResponseDto {
  @ApiProperty({ example: 422 })
  status: number;

  @ApiProperty({ example: 'Invalid signature' })
  message: string;
} 