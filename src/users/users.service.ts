import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PRISMA_DATABASE } from '@/database/database.constants';
import { PrismaClient } from '../../prisma/client/postgresql';
import {
  QueryUserDto,
  UserListResponseDto,
  UserResponseDto,
  UpdateUserRolesDto
} from './dto';

@Injectable()
export class UsersService {
  constructor(@Inject(PRISMA_DATABASE) private prismaClient: PrismaClient) { }

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // 查找名为"user"的默认角色ID
    const userRole = await this.prismaClient.role.findUnique({
      where: { name: 'user' },
    });

    if (!userRole) {
      throw new Error('默认用户角色不存在，请先创建角色');
    }

    // 创建用户并关联默认角色
    return await this.prismaClient.user.create({
      data: {
        name: createUserDto.name,
        address: createUserDto.address,
        email: createUserDto.email,
        avatar: createUserDto.avatar,
        bio: createUserDto.bio,
        roles: {
          create: [
            {
              roleId: userRole.id
            }
          ]
        }
      },
      include: {
        roles: {
          include: {
            Role: true
          }
        }
      }
    });
  }

  /**
   * 查询用户列表，支持模糊搜索
   */
  async findAll(query: QueryUserDto): Promise<UserListResponseDto> {
    const { page = 1, pageSize = 10, name, address } = query;
    const skip = (page - 1) * pageSize;

    // 构建查询条件
    const where: any = {};

    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive', // 忽略大小写
      };
    }

    if (address) {
      where.address = {
        contains: address,
        mode: 'insensitive', // 忽略大小写
      };
    }

    // 执行查询
    const [users, total] = await Promise.all([
      this.prismaClient.user.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: {
          id: 'asc',
        },
        include: {
          roles: {
            include: {
              Role: true,
            },
          },
        },
      }),
      this.prismaClient.user.count({ where }),
    ]);

    // 格式化用户数据
    const items = users.map(user => ({
      id: user.id,
      address: user.address,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      createdAt: user.createdAt,
      roles: user.roles.map(role => ({
        id: role.Role.id,
        name: role.Role.name,
        description: role.Role.description,
      })),
    }));

    return {
      items,
      total,
      page,
      pageSize,
    };
  }

  async findOne(id: number): Promise<UserResponseDto> {
    const user = await this.prismaClient.user.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            Role: true,
          },
        },
      },
    });

    return {
      id: user.id,
      address: user.address,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt,
      bio: user.bio,
      roles: user.roles.map(role => ({
        id: role.Role.id,
        name: role.Role.name,
        description: role.Role.description,
      })),
    };
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    await this.prismaClient.user.update({
      where: { id },
      data: updateUserDto,
    });

    return this.findOne(id);
  }

  async remove(id: number): Promise<UserResponseDto> {
    // 先获取用户信息
    const user = await this.findOne(id);

    // 删除用户
    await this.prismaClient.user.delete({
      where: { id },
    });

    return user;
  }

  async findByAddress(address: string): Promise<UserResponseDto> {
    const user = await this.prismaClient.user.findUnique({
      where: { address },
      include: {
        roles: {
          include: {
            Role: true
          }
        }
      }
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      address: user.address,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt,
      bio: user.bio,
      roles: user.roles.map(role => ({
        id: role.Role.id,
        name: role.Role.name,
        description: role.Role.description,
      })),
    };
  }

  /**
   * 更新用户角色
   */
  async updateRoles(userId: number, updateUserRolesDto: UpdateUserRolesDto): Promise<UserResponseDto> {
    // 首先检查用户是否存在
    const user = await this.prismaClient.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`用户ID ${userId} 不存在`);
    }

    // 检查所有角色是否存在
    const roleIds = updateUserRolesDto.roleIds;
    const existingRoles = await this.prismaClient.role.findMany({
      where: { id: { in: roleIds } },
      select: { id: true },
    });

    if (existingRoles.length !== roleIds.length) {
      // 找出不存在的角色ID
      const existingRoleIds = existingRoles.map(r => r.id);
      const nonExistentRoleIds = roleIds.filter(id => !existingRoleIds.includes(id));
      throw new NotFoundException(`角色ID ${nonExistentRoleIds.join(', ')} 不存在`);
    }

    // 使用事务更新用户角色
    await this.prismaClient.$transaction(async (tx) => {
      // 1. 删除用户现有的所有角色关联
      await tx.userRole.deleteMany({
        where: { userId },
      });

      // 2. 创建新的角色关联
      if (roleIds.length > 0) {
        await tx.userRole.createMany({
          data: roleIds.map(roleId => ({
            userId,
            roleId,
          })),
          skipDuplicates: true,
        });
      }
    });

    // 返回更新后的用户信息
    return this.findOne(userId);
  }
}
