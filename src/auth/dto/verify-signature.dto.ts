import { IsNotEmpty, IsString } from 'class-validator';

export class VerifySignatureDto {
  @IsNotEmpty()
  @IsString()
  message: string;

  @IsNotEmpty()
  @IsString()
  signature: string;
}
