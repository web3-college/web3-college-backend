import { Injectable, CanActivate, ExecutionContext, Inject, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PRISMA_DATABASE } from '@/database/database.constants';
import { PrismaClient } from '../../../prisma/client/postgresql';
import { PERMISSION_KEY } from '../decorators/role-permission.decorator';

@Injectable()
export class RolePermissionGuard implements CanActivate {
  private readonly logger = new Logger(RolePermissionGuard.name);

  constructor(
    private reflector: Reflector,
    @Inject(PRISMA_DATABASE) private prismaClient: PrismaClient,
  ) { }

  /**
   * 验证用户是否有权限访问
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const classPermission = this.reflector.get(
      PERMISSION_KEY,
      context.getClass()
    )
    // 如果没有设置权限要求，则允许访问
    if (!classPermission?.length) {
      return true;
    }
    // 仅从装饰器中获取所需的权限
    const handlerPermission = this.reflector.get(
      PERMISSION_KEY,
      context.getHandler()
    );
    // 如果没有设置权限要求，则允许访问
    if (!handlerPermission?.length) {
      return true;
    }

    const cls =
      classPermission instanceof Array
        ? classPermission.join('')
        : classPermission;
    const handler =
      handlerPermission instanceof Array
        ? handlerPermission.join('')
        : handlerPermission;

    const right = `${cls}:${handler}`

    // 获取请求对象
    const request = context.switchToHttp().getRequest();

    const userId = request.session.userId;


    // 如果没有用户ID，则拒绝访问
    if (!userId) {
      return false;
    }

    // 查询用户的角色
    const userRoles = await this.prismaClient.userRole.findMany({
      where: { userId },
      include: { Role: true },
    });

    // 如果用户没有角色，则拒绝访问
    if (!userRoles || userRoles.length === 0) {
      return false;
    }

    // 获取用户角色ID
    const roleIds = userRoles.map(ur => ur.roleId);

    // 查询这些角色拥有的权限
    const rolePermissions = await this.prismaClient.rolePermissions.findMany({
      where: { roleId: { in: roleIds } },
      include: { permission: true },
    });
    // 获取用户的所有权限名
    const permissionNames =
      rolePermissions.map(rp => rp.permission.name)
        .reduce((acc, cur) => {
          return [...new Set([...acc, cur])]
        }, []);


    // 检查是否拥有要求的权限
    const hasRequiredPermission = permissionNames.includes(right);

    return hasRequiredPermission;
  }
}
