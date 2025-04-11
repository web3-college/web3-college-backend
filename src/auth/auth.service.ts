import { Injectable, UnauthorizedException } from '@nestjs/common';
import { generateNonce, SiweMessage, SiweResponse } from 'siwe';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
  ) { }

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
    id: number;
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

      return {
        fields,
        id: user.id,
      };
    } catch (error) {
      throw new UnauthorizedException('Authentication failed');
    }
  }

  /**
   * 检查用户是否有后台管理权限
   * @param address 用户的以太坊地址
   * @returns 布尔值，表示用户是否有后台权限
   */
  async isAdmin(address: string): Promise<{ hasAccess: boolean }> {
    // 获取用户信息
    const user = await this.usersService.findByAddress(address);

    if (!user) {
      return { hasAccess: false };
    }

    // 检查用户角色是否包含super、admin或manager
    const hasAdminRole = user.roles.some(role =>
      process.env.ADMIN_ROLE.split(',').includes(role.name)
    );

    return { hasAccess: hasAdminRole };
  }
}
