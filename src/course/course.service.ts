import { Inject, Injectable } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CreateCourseSectionDto } from './dto/create-course-section.dto';
import { UpdateCourseSectionDto } from './dto/update-course-section.dto';
import { PRISMA_DATABASE } from '@/database/database.constants';
import { PrismaClient } from 'prisma/client/postgresql'

@Injectable()
export class CourseService {
  constructor(@Inject(PRISMA_DATABASE) private prisma: PrismaClient) {}

  // 创建课程
  async createCourse(data: CreateCourseDto) {
    const { sections, ...courseData } = data;
    
    // 使用事务来确保课程和章节一起创建
    return this.prisma.$transaction(async (tx) => {
      // 1. 创建课程
      const course = await tx.course.create({
        data: courseData,
      });
      
      // 2. 如果有章节数据，创建章节
      if (sections && sections.length > 0) {
        // 为每个章节添加课程ID，并设置顺序
        const sectionsWithCourseId = sections.map((section, index) => ({
          ...section,
          courseId: course.id,
          order: section.order || index + 1, // 如果没有提供顺序，使用数组索引+1
        }));
        
        // 批量创建章节
        await tx.courseSection.createMany({
          data: sectionsWithCourseId,
        });
      }
      
      // 3. 返回带有章节的课程
      return tx.course.findUnique({
        where: { id: course.id },
        include: {
          sections: {
            orderBy: {
              order: 'asc',
            },
          },
          category: true,
        },
      });
    });
  }

  // 获取所有课程
  async findAllCourses(skip = 0, take = 10, isActive?: boolean, categoryId?: number) {
    const where: any = {};
    
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    
    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        skip,
        take,
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

  // 获取单个课程
  async findCourseById(id: number) {
    return this.prisma.course.findUnique({
      where: { id },
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
    });
  }

  // 更新课程
  async updateCourse(id: number, data: UpdateCourseDto) {
    return this.prisma.course.update({
      where: { id },
      data,
      include: {
        sections: true,
        category: true,
      },
    });
  }

  // 删除课程
  async deleteCourse(id: number) {
    return this.prisma.course.delete({
      where: { id },
    });
  }

  // 获取课程的所有章节
  async findAllCourseSections(courseId: number) {
    return this.prisma.courseSection.findMany({
      where: { courseId },
      orderBy: {
        order: 'asc',
      },
    });
  }

  // 获取单个章节
  async findCourseSectionById(id: number) {
    return this.prisma.courseSection.findUnique({
      where: { id },
    });
  }

  // 更新章节
  async updateCourseSection(id: number, data: UpdateCourseSectionDto) {
    return this.prisma.courseSection.update({
      where: { id },
      data,
    });
  }

  // 删除章节
  async deleteCourseSection(id: number) {
    return this.prisma.courseSection.delete({
      where: { id },
    });
  }

  // 根据创建者地址获取课程
  async findCoursesByCreator(creatorAddress: string, skip = 0, take = 10) {
    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        where: { creator: creatorAddress },
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
      this.prisma.course.count({
        where: { creator: creatorAddress },
      }),
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