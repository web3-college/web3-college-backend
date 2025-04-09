import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CreateCourseSectionDto } from './dto/create-course-section.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { RolePermissionGuard } from '@/common/guards/role-permission.guard';
import { Permission, Create, Read, Update, Delete as Remove } from '@/common/decorators/role-permission.decorator';
@ApiTags('course')
@UseGuards(RolePermissionGuard)
@Permission('course')
@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) { }

  // 创建课程
  @Post()
  @ApiOperation({ summary: '创建课程', description: '创建一个新课程，可以包含多个章节' })
  @ApiBody({ type: CreateCourseDto })
  @ApiResponse({ status: 201, description: '课程创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @Create()
  async createCourse(@Body() createCourseDto: CreateCourseDto) {
    return this.courseService.createCourse(createCourseDto);
  }

  // 获取所有课程
  @Get()
  @ApiOperation({ summary: '获取课程列表', description: '分页获取课程列表，可按分类和状态筛选' })
  @ApiQuery({ name: 'page', description: '页码', required: false, type: Number })
  @ApiQuery({ name: 'limit', description: '每页数量', required: false, type: Number })
  @ApiQuery({ name: 'isActive', description: '是否激活', required: false, type: Boolean })
  @ApiQuery({ name: 'categoryId', description: '分类ID', required: false, type: Number })
  @ApiResponse({ status: 200, description: '课程列表' })
  async findAllCourses(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('isActive') isActive?: boolean,
    @Query('categoryId') categoryId?: string,
  ) {
    const skip = (page - 1) * limit;
    const categoryIdNum = categoryId ? parseInt(categoryId, 10) : undefined;
    return this.courseService.findAllCourses(skip, limit, isActive, categoryIdNum);
  }

  // 获取单个课程
  @Get(':id')
  @ApiOperation({ summary: '获取课程详情' })
  @ApiParam({ name: 'id', description: '课程ID', type: Number })
  @ApiResponse({ status: 200, description: '课程详情' })
  @ApiResponse({ status: 404, description: '课程不存在' })
  async findCourseById(@Param('id', ParseIntPipe) id: number) {
    return this.courseService.findCourseById(id);
  }

  // 更新课程
  @Put(':id')
  @ApiOperation({ summary: '更新课程', description: '更新课程信息，可以同时更新、添加或删除章节' })
  @ApiParam({ name: 'id', description: '课程ID', type: Number })
  @ApiBody({ type: UpdateCourseDto })
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
  @ApiParam({ name: 'id', description: '课程ID', type: Number })
  @ApiResponse({ status: 200, description: '课程删除成功' })
  @ApiResponse({ status: 404, description: '课程不存在' })
  @Remove()
  async deleteCourse(@Param('id', ParseIntPipe) id: number) {
    return this.courseService.deleteCourse(id);
  }

  // 创建课程章节
  @Post(':courseId/sections')
  @ApiOperation({ summary: '创建课程章节' })
  @ApiParam({ name: 'courseId', description: '课程ID', type: Number })
  @ApiBody({ type: CreateCourseSectionDto })
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
  @ApiParam({ name: 'courseId', description: '课程ID', type: Number })
  @ApiResponse({ status: 200, description: '章节列表' })
  @ApiResponse({ status: 404, description: '课程不存在' })
  @Read()
  async findAllCourseSections(
    @Param('courseId', ParseIntPipe) courseId: number,
  ) {
    return this.courseService.findAllCourseSections(courseId);
  }

  // 获取创建者的课程
  @Get('creator/:address')
  @ApiOperation({ summary: '获取创建者的课程列表' })
  @ApiParam({ name: 'address', description: '创建者钱包地址', type: String })
  @ApiQuery({ name: 'page', description: '页码', required: false, type: Number })
  @ApiQuery({ name: 'limit', description: '每页数量', required: false, type: Number })
  @ApiResponse({ status: 200, description: '课程列表' })
  @Read()
  async findCoursesByCreator(
    @Param('address') creatorAddress: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const skip = (page - 1) * limit;
    return this.courseService.findCoursesByCreator(creatorAddress, skip, limit);
  }
}
