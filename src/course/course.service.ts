import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CreateCourseSectionDto } from './dto/create-course-section.dto';
import { PRISMA_DATABASE } from '@/database/database.constants';
import { PrismaClient } from 'prisma/client/postgresql'

@Injectable()
export class CourseService {
  constructor(@Inject(PRISMA_DATABASE) private prisma: PrismaClient) { }

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
          data: sectionsWithCourseId.map(section => ({
            ...section,
            videoUrl: section.videoUrl || '', // 确保 videoUrl 有值
          })),
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
  async findAllCourses(skip = 0, take = 10, query: { isActive?: boolean, categoryId?: number, name?: string }) {
    const where: any = {};

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.name) {
      where.name = {
        contains: query.name,
        mode: 'insensitive', // 忽略大小写
      };
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
      items: courses,
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
      totalPages: Math.ceil(total / take),
    };
  }

  // 获取单个课程
  async findCourseById(id: number) {
    const course = await this.prisma.course.findUnique({
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

    if (!course) {
      throw new NotFoundException(`课程ID ${id} 不存在`);
    }

    return course;
  }

  // 更新课程
  async updateCourse(id: number, data: UpdateCourseDto) {
    const { sections, ...courseData } = data;

    // 确保课程存在
    const existingCourse = await this.prisma.course.findUnique({
      where: { id },
      include: { sections: true }
    });

    if (!existingCourse) {
      throw new NotFoundException(`课程ID ${id} 不存在`);
    }

    // 使用事务来确保课程和章节一起更新
    return this.prisma.$transaction(async (tx) => {
      // 1. 更新课程
      const updatedCourse = await tx.course.update({
        where: { id },
        data: courseData,
      });

      // 2. 如果提供了章节数据，更新章节
      if (sections && sections.length > 0) {
        // 获取现有章节ID
        const existingSectionIds = existingCourse.sections.map(section => section.id);

        // 获取要更新的章节ID和要创建的新章节
        const updateSections = sections.filter(section => section.id);
        const newSections = sections.filter(section => !section.id);

        // 要删除的章节ID（现有章节中不在更新列表中的）
        const updateSectionIds = updateSections.map(section => section.id);
        const deleteSectionIds = existingSectionIds.filter(id => !updateSectionIds.includes(id));

        // 删除不再需要的章节
        if (deleteSectionIds.length > 0) {
          await tx.courseSection.deleteMany({
            where: {
              id: {
                in: deleteSectionIds
              }
            }
          });
        }

        // 更新现有章节
        for (const section of updateSections) {
          await tx.courseSection.update({
            where: { id: section.id },
            data: section,
          });
        }

        // 创建新章节
        if (newSections.length > 0) {
          // 找出当前最大顺序号
          const maxOrder = existingCourse.sections.length > 0
            ? Math.max(...existingCourse.sections.map(s => s.order))
            : 0;

          // 为新章节添加课程ID和顺序
          const newSectionsWithCourseId = newSections.map((section, index) => ({
            ...section,
            courseId: id,
            order: section.order || maxOrder + index + 1,
          }));
          await tx.courseSection.createMany({
            data: newSectionsWithCourseId.map(section => ({
              ...section,
              title: section.title || '',
              description: section.description || '',
              videoUrl: section.videoUrl || ''
            })),
          });
        }
      }
      // 3. 返回更新后的课程
      return tx.course.findUnique({
        where: { id },
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

  // 删除课程
  async deleteCourse(id: number) {
    // 使用事务确保删除课程的同时删除相关章节
    return this.prisma.$transaction(async (tx) => {
      // 1. 删除课程相关的章节
      await tx.courseSection.deleteMany({
        where: { courseId: id },
      });

      // 2. 删除课程
      return tx.course.delete({
        where: { id },
      });
    });
  }

  // 创建课程章节
  async createCourseSection(courseId: number, data: CreateCourseSectionDto) {
    // 确保课程存在
    await this.findCourseById(courseId);

    // 获取当前最高的章节顺序
    const sections = await this.prisma.courseSection.findMany({
      where: { courseId },
      orderBy: { order: 'desc' },
      take: 1,
    });

    const order = sections.length > 0 ? sections[0].order + 1 : 1;

    // 创建章节
    return this.prisma.courseSection.create({
      data: {
        title: data.title,
        description: data.description,
        videoUrl: data.videoUrl,
        course: {
          connect: { id: courseId }
        },
        order: data.order || order,
      },
    });
  }

  // 获取课程的所有章节
  async findAllCourseSections(courseId: number) {
    // 确保课程存在
    await this.findCourseById(courseId);

    return this.prisma.courseSection.findMany({
      where: { courseId },
      orderBy: {
        order: 'asc',
      },
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
      items: courses,
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
      totalPages: Math.ceil(total / take),
    };
  }
} 