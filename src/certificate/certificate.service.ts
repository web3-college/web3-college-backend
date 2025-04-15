import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PRISMA_DATABASE } from '@/database/database.constants';
import { PrismaClient, CertificateStatus } from 'prisma/client/postgresql';
import { CreateCertificateRequestDto, UpdateCertificateStatusDto } from './dto';
import { hasCourse } from '@/utils/use-contract';

@Injectable()
export class CertificateService {
  constructor(@Inject(PRISMA_DATABASE) private prisma: PrismaClient) { }

  // 创建证书请求
  async createCertificateRequest(userId: number, address: string, data: CreateCertificateRequestDto) {
    const { courseId, notes } = data;

    // 确保课程存在
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException(`课程ID ${courseId} 不存在`);
    }

    // 检查用户是否已购买课程
    let isHasCourse = false;
    isHasCourse = await hasCourse(address, courseId.toString());

    if (!isHasCourse) {
      throw new BadRequestException('用户未购买该课程');
    }

    // 检查是否有未完成的证书请求
    const existingRequest = await this.prisma.certificateRequest.findFirst({
      where: {
        userId,
        courseId,
        status: {
          in: [CertificateStatus.PENDING, CertificateStatus.APPROVED],
        },
      },
    });

    if (existingRequest) {
      throw new BadRequestException('已存在处理中的证书请求');
    }

    // 检查学习进度
    const sections = await this.prisma.courseSection.count({
      where: { courseId },
    });

    const completedSections = await this.prisma.courseProgress.count({
      where: {
        userId: userId.toString(),
        courseId,
        status: 'COMPLETED',
      },
    });

    if (sections > 0 && completedSections / sections < 1) {
      throw new BadRequestException('课程完成度不足100%，无法申请证书');
    }

    // 创建证书请求
    return this.prisma.certificateRequest.create({
      data: {
        userId,
        address,
        courseId,
        notes,
        status: CertificateStatus.PENDING,
      },
    });
  }

  // 更新证书请求状态
  async updateCertificateStatus(data: UpdateCertificateStatusDto) {
    const { id, status, feedback = '' } = data;

    // 确保证书请求存在
    const certificateRequest = await this.prisma.certificateRequest.findUnique({
      where: { id },
    });

    if (!certificateRequest) {
      throw new NotFoundException('证书请求不存在');
    }

    // 更新证书请求状态
    return this.prisma.certificateRequest.update({
      where: { id },
      data: {
        status,
        feedback,
      },
    });
  }

  // 获取用户的所有证书请求
  async getUserCertificateRequests(userId: number) {
    return this.prisma.certificateRequest.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            coverImage: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // 获取所有证书请求（管理员使用）
  async getAllCertificateRequests(status?: CertificateStatus, address?: string, page = 1, pageSize = 10) {
    // 构建查询条件
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (address) {
      where.address = address;
    }

    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      this.prisma.certificateRequest.findMany({
        where,
        include: {
          course: {
            select: {
              id: true,
              name: true,
            }
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: pageSize,
      }),
      this.prisma.certificateRequest.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
} 