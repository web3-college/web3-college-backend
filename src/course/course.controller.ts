import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, Req } from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto, UpdateCourseDto, QueryCourseDto, CourseListResponseDto, CourseResponseDto, SavePurchaseRecordDto } from './dto';
import { CreateCourseSectionDto } from './dto/create-course-section.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBody, ApiOkResponse } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { RolePermissionGuard } from '@/common/guards/role-permission.guard';
import { Permission, Create, Read, Update, Delete as Remove } from '@/common/decorators/role-permission.decorator';
import { apiResponse } from '@/common/models/swagger.model';
import { Request } from 'express';
import { hasCourse } from '@/utils/use-contract';

@ApiTags('course')
@UseGuards(RolePermissionGuard)
@Permission('course')
@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) { }

  // 创建课程
  @Post()
  @ApiOperation({ summary: '创建课程', description: '创建一个新课程，可以包含多个章节' })
  @ApiResponse({ status: 201, description: '课程创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @Create()
  async createCourse(@Body() createCourseDto: CreateCourseDto) {
    return this.courseService.createCourse(createCourseDto);
  }

  // 获取所有课程
  @Get()
  @ApiOperation({ summary: '获取课程列表', description: '分页获取课程列表，可按分类、状态和名称筛选' })
  @ApiResponse(apiResponse(CourseListResponseDto, '获取课程列表成功'))
  async findAllCourses(@Query() query: QueryCourseDto): Promise<CourseListResponseDto> {
    const { page = 1, pageSize = 10, ...filters } = query;
    const skip = (page - 1) * pageSize;
    return this.courseService.findAllCourses(skip, Number(pageSize), filters);
  }

  // 获取单个课程
  @Get(':id')
  @ApiOperation({ summary: '获取课程详情' })
  @ApiResponse(apiResponse(CourseResponseDto, '获取课程详情成功'))
  async findCourseById(@Param('id', ParseIntPipe) id: number) {
    return this.courseService.findCourseById(id);
  }

  // 更新课程
  @Put(':id')
  @ApiOperation({ summary: '更新课程', description: '更新课程信息，可以同时更新、添加或删除章节' })
  @ApiResponse({ status: 200, description: '课程更新成功' })
  @ApiResponse({ status: 404, description: '课程不存在' })
  @Update()
  async updateCourse(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return this.courseService.updateCourse(id, updateCourseDto);
  }

  // 删除课程
  @Delete(':id')
  @ApiOperation({ summary: '删除课程', description: '删除课程及其所有章节' })
  @ApiResponse({ status: 200, description: '课程删除成功' })
  @ApiResponse({ status: 404, description: '课程不存在' })
  @Remove()
  async deleteCourse(@Param('id', ParseIntPipe) id: number) {
    return this.courseService.deleteCourse(id);
  }

  // 创建课程章节
  @Post(':courseId/sections')
  @ApiOperation({ summary: '创建课程章节' })
  @ApiResponse({ status: 201, description: '章节创建成功' })
  @ApiResponse({ status: 404, description: '课程不存在' })
  @Create()
  async createCourseSection(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() createCourseSectionDto: CreateCourseSectionDto,
  ) {
    return this.courseService.createCourseSection(courseId, createCourseSectionDto);
  }

  // 获取课程的所有章节
  @Get(':courseId/sections')
  @ApiOperation({ summary: '获取课程章节列表' })
  @ApiResponse({ status: 200, description: '章节列表' })
  @ApiResponse({ status: 404, description: '课程不存在' })
  async findAllCourseSections(
    @Req() request: Request,
    @Param('courseId', ParseIntPipe) courseId: number
  ) {
    let isHasCourse = false;
    if (request.session.siwe) {
      const { address } = request.session?.siwe;
      if (address) {
        isHasCourse = await hasCourse(address, courseId.toString());
      }
    }
    return this.courseService.findAllCourseSections(courseId, isHasCourse);
  }

  // 获取创建者的课程
  @Get('creator/:address')
  @ApiOperation({ summary: '获取创建者的课程', description: '获取指定创建者的所有课程' })
  @ApiResponse({ status: 200, description: '课程列表', type: CourseListResponseDto })
  @Read()
  async findCoursesByCreator(
    @Param('address') creatorAddress: string,
    @Query() query: QueryCourseDto,
  ): Promise<CourseListResponseDto> {
    const { page = 1, pageSize = 10 } = query;
    const skip = (page - 1) * pageSize;
    return this.courseService.findCoursesByCreator(creatorAddress, skip, pageSize);
  }

  // 保存购买记录
  @Post('purchase')
  @ApiOperation({ summary: '保存购买记录', description: '保存用户购买课程的记录' })
  @ApiBody({ type: SavePurchaseRecordDto })
  @ApiResponse({ status: 200, description: '购买记录保存成功' })
  @ApiResponse({ status: 404, description: '课程不存在' })
  async savePurchaseRecord(
    @Body() savePurchaseRecordDto: SavePurchaseRecordDto,
  ) {
    return this.courseService.savePurchaseRecord(savePurchaseRecordDto);
  }
}
