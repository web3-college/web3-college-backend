import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifySignatureDto {
  @ApiProperty({
    description: 'SIWE消息对象，包含用户地址和签名内容',
    example: '{"domain":"localhost:3000","address":"0x...","statement":"Sign in with Ethereum","nonce":"..."}'
  })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiProperty({
    description: '以太坊签名',
    example: '0x...'
  })
  @IsNotEmpty()
  @IsString()
  signature: string;
}
