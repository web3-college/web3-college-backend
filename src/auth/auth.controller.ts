import { Controller, Post, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { VerifySignatureDto } from './dto/verify-signature.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('nonce')
  getNonce() {
    return { nonce: this.authService.getNonce() };
  }

  @Post('verify')
  verifySignature(@Body() verifySignatureDto: VerifySignatureDto) {
    return this.authService.verifySignature(
      verifySignatureDto.message,
      verifySignatureDto.signature,
    );
  }
}
