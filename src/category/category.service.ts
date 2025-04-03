import { Inject, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PRISMA_DATABASE } from '@/database/database.constants';
import { PrismaClient } from 'prisma/client/postgresql';

@Injectable()
export class CategoryService {
  constructor(@Inject(PRISMA_DATABASE) private prisma: PrismaClient) {}

  // 创建分类
  async createCategory(data: CreateCategoryDto) {
    return this.prisma.category.create({
      data,
    });
  }

  // 获取所有分类
  async findAllCategories(isActive?: boolean) {
    const where = isActive !== undefined ? { isActive } : {};
    
    return this.prisma.category.findMany({
      where,
      orderBy: {
        order: 'asc',
      },
      include: {
        _count: {
          select: {
            courses: true,
          }
        }
      }
    });
  }

  // 获取单个分类
  async findCategoryById(id: number) {
    return this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            courses: true,
          }
        }
      }
    });
  }

  // 更新分类
  async updateCategory(id: number, data: UpdateCategoryDto) {
    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  // 删除分类
  async deleteCategory(id: number) {
    // 检查分类下是否有课程
    const coursesCount = await this.prisma.course.count({
      where: { categoryId: id },
    });
    
    if (coursesCount > 0) {
      // 将该分类下的课程设为无分类
      await this.prisma.course.updateMany({
        where: { categoryId: id },
        data: { categoryId: null },
      });
    }
    
    return this.prisma.category.delete({
      where: { id },
    });
  }

  // 根据分类获取课程
  async findCoursesByCategory(categoryId: number, skip = 0, take = 10, isActive?: boolean) {
    const where: any = { categoryId };
    
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    
    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        include: {
          sections: {
            orderBy: {
              order: 'asc',
            },
          },
          category: true,
          _count: {
            select: {
              purchasedCourses: true,
            }
          }
        },
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.course.count({ where }),
    ]);

    return {
      courses,
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
      totalPages: Math.ceil(total / take),
    };
  }
} 