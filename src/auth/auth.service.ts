import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { generateNonce, SiweMessage, SiweResponse } from 'siwe';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // 生成随机nonce
  getNonce(): string {
    const nonce = generateNonce();
    return nonce;
  }

  async verifySignature(
    message: string,
    signature: string,
    nonce: string,
  ): Promise<{
    fields: SiweResponse;
    access_token: string;
    user: any;
  }> {
    try {
      const siweMessage = new SiweMessage(message);
      const fields = await siweMessage.verify({ signature, nonce });

      if (!fields.success) {
        throw new UnauthorizedException('Invalid signature');
      }

      // 获取用户的以太坊地址
      const address = fields.data.address;

      // 查找或创建用户
      let user = await this.usersService.findByAddress(address);

      if (!user) {
        user = await this.usersService.create({
          address: address,
          name: `user_${address.substring(0, 8)}`,
        });
      }

      // 生成JWT令牌
      const payload = {
        sub: user.id,
        address: user.address,
      };

      return {
        fields,
        access_token: this.jwtService.sign(payload),
        user,
      };
    } catch (error) {
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
