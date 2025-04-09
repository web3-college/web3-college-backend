import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PRISMA_DATABASE } from '@/database/database.constants';
import { PrismaClient } from '../../prisma/client/postgresql';
import { QueryRoleDto } from './dto/query-role.dto';
import { RoleListResponseDto, RoleResponseDto } from './dto';
import { PermissionService } from '../permission/permission.service';

@Injectable()
export class RoleService {
  private readonly logger = new Logger(RoleService.name);

  constructor(
    @Inject(PRISMA_DATABASE) private prismaClient: PrismaClient,
    private permissionService: PermissionService
  ) { }

  /**
   * 创建角色
   */
  async create(createRoleDto: CreateRoleDto): Promise<RoleResponseDto> {
    const { name, description, permissionIds } = createRoleDto;

    // 使用事务确保角色和权限关系的一致性
    return this.prismaClient.$transaction(async (tx) => {
      // 1. 创建角色
      const role = await tx.role.create({
        data: {
          name,
          description,
        },
      });

      // 2. 如果有权限，创建角色-权限关系
      if (permissionIds && permissionIds.length > 0) {
        await this.assignPermissionsToRole(tx, role.id, permissionIds);
      }

      // 3. 返回创建的角色（含权限关系）
      return await tx.role.findUnique({
        where: { id: role.id },
        include: {
          RolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      });
    });
  }

  /**
   * 查询角色列表
   */
  async findAll(query: QueryRoleDto): Promise<RoleListResponseDto> {
    const { page = 1, pageSize = 10, name } = query;
    const skip = (page - 1) * pageSize;

    // 构建查询条件
    const where: any = {};
    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive', // 忽略大小写
      };
    }

    // 执行查询
    const [roles, total] = await Promise.all([
      this.prismaClient.role.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: {
          id: 'asc',
        },
        include: {
          RolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      }),
      this.prismaClient.role.count({ where }),
    ]);

    // 格式化角色权限信息
    const items = roles.map(role => ({
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.RolePermissions.map(rp => ({
        id: rp.permission.id,
        name: rp.permission.name,
        action: rp.permission.action,
        description: rp.permission.description,
      })),
    }));

    return {
      items,
      total,
      page,
      pageSize,
    };
  }

  /**
   * 查询单个角色
   */
  async findOne(id: number): Promise<RoleResponseDto> {
    const role = await this.prismaClient.role.findUnique({
      where: { id },
      include: {
        RolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    // 格式化角色信息
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.RolePermissions.map(rp => ({
        id: rp.permission.id,
        name: rp.permission.name,
        action: rp.permission.action,
        description: rp.permission.description,
      })),
    };
  }

  /**
   * 更新角色
   */
  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<RoleResponseDto> {
    const { name, description, permissionIds } = updateRoleDto;

    // 使用事务确保一致性
    return this.prismaClient.$transaction(async (tx) => {
      // 1. 更新角色基本信息
      await tx.role.update({
        where: { id },
        data: {
          name,
          description,
        },
      });

      // 2. 如果更新了权限列表，则先删除全部旧关系，再创建新关系
      if (permissionIds) {
        // 删除现有的角色-权限关系
        await tx.rolePermissions.deleteMany({
          where: { roleId: id },
        });

        // 重新建立角色-权限关系
        if (permissionIds.length > 0) {
          await this.assignPermissionsToRole(tx, id, permissionIds);
        }
      }

      // 3. 返回更新后的角色
      const updatedRole = await tx.role.findUnique({
        where: { id },
        include: {
          RolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      });

      return {
        id: updatedRole.id,
        name: updatedRole.name,
        description: updatedRole.description,
        permissions: updatedRole.RolePermissions.map(rp => ({
          id: rp.permission.id,
          name: rp.permission.name,
          action: rp.permission.action,
          description: rp.permission.description,
        })),
      };
    });
  }

  /**
   * 删除角色
   */
  async remove(id: number): Promise<RoleResponseDto> {
    // 先获取角色信息，以便返回完整信息
    const role = await this.findOne(id);

    // 使用事务确保一致性
    await this.prismaClient.$transaction(async (tx) => {
      // 1. 删除角色-权限关系
      await tx.rolePermissions.deleteMany({
        where: { roleId: id },
      });

      // 2. 删除角色-用户关系
      await tx.userRole.deleteMany({
        where: { roleId: id },
      });

      // 3. 删除角色
      await tx.role.delete({
        where: { id },
      });
    });

    return role;
  }

  /**
   * 为角色分配权限
   */
  private async assignPermissionsToRole(tx: any, roleId: number, permissionIds: number[]): Promise<void> {
    const rolePermissions = permissionIds.map(permissionId => ({
      roleId,
      permissionId,
    }));

    await tx.rolePermissions.createMany({
      data: rolePermissions,
      skipDuplicates: true,
    });
  }
}
