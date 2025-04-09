import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PRISMA_DATABASE } from '@/database/database.constants';
import { PrismaClient } from '../../prisma/client/postgresql';
import { QueryPermissionDto } from './dto/query-permission.dto';
import { PermissionListResponseDto, PermissionResponseDto } from './dto';

@Injectable()
export class PermissionService {

  constructor(@Inject(PRISMA_DATABASE) private prismaClient: PrismaClient) { }

  /**
   * 创建权限
   */
  async create(createPermissionDto: CreatePermissionDto): Promise<PermissionResponseDto> {
    return this.prismaClient.permission.create({
      data: createPermissionDto,
    });
  }

  /**
   * 查询权限列表
   */
  async findAll(query: QueryPermissionDto): Promise<PermissionListResponseDto> {
    const { page = 1, pageSize = 10, name, action } = query;
    const skip = (page - 1) * pageSize;

    // 构建查询条件
    const where: any = {};
    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive', // 忽略大小写
      };
    }
    if (action) {
      where.action = {
        contains: action,
        mode: 'insensitive',
      };
    }

    // 执行查询
    const [data, total] = await Promise.all([
      this.prismaClient.permission.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: {
          id: 'asc',
        },
      }),
      this.prismaClient.permission.count({ where }),
    ]);

    return {
      items: data,
      total,
      page,
      pageSize,
    };
  }

  /**
   * 查询单个权限
   */
  async findOne(id: number): Promise<PermissionResponseDto> {
    return this.prismaClient.permission.findUnique({
      where: { id },
    });
  }

  /**
   * 更新权限
   */
  async update(id: number, updatePermissionDto: UpdatePermissionDto): Promise<PermissionResponseDto> {
    return this.prismaClient.permission.update({
      where: { id },
      data: updatePermissionDto,
    });
  }

  /**
   * 删除权限
   */
  async remove(id: number): Promise<PermissionResponseDto> {
    return this.prismaClient.permission.delete({
      where: { id },
    });
  }
}
