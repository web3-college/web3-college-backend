import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { UpdateCourseSectionDto } from './dto/update-course-section.dto';

@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  // 创建课程
  @Post()
  async createCourse(@Body() createCourseDto: CreateCourseDto) {
    return this.courseService.createCourse(createCourseDto);
  }

  // 获取所有课程
  @Get()
  async findAllCourses(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('isActive') isActive?: boolean,
    @Query('categoryId', new ParseIntPipe({ optional: true })) categoryId?: number,
  ) {
    const skip = (page - 1) * limit;
    return this.courseService.findAllCourses(skip, limit, isActive, categoryId);
  }

  // 获取单个课程
  @Get(':id')
  async findCourseById(@Param('id', ParseIntPipe) id: number) {
    return this.courseService.findCourseById(id);
  }

  // 更新课程
  @Put(':id')
  async updateCourse(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return this.courseService.updateCourse(id, updateCourseDto);
  }

  // 删除课程
  @Delete(':id')
  async deleteCourse(@Param('id', ParseIntPipe) id: number) {
    return this.courseService.deleteCourse(id);
  }

  // 获取课程的所有章节
  @Get(':courseId/sections')
  async findAllCourseSections(
    @Param('courseId', ParseIntPipe) courseId: number,
  ) {
    return this.courseService.findAllCourseSections(courseId);
  }

  // 获取单个章节
  @Get('sections/:id')
  async findCourseSectionById(@Param('id', ParseIntPipe) id: number) {
    return this.courseService.findCourseSectionById(id);
  }

  // 更新章节
  @Put('sections/:id')
  async updateCourseSection(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCourseSectionDto: UpdateCourseSectionDto,
  ) {
    return this.courseService.updateCourseSection(id, updateCourseSectionDto);
  }

  // 删除章节
  @Delete('sections/:id')
  async deleteCourseSection(@Param('id', ParseIntPipe) id: number) {
    return this.courseService.deleteCourseSection(id);
  }

  // 获取创建者的课程
  @Get('creator/:address')
  async findCoursesByCreator(
    @Param('address') creatorAddress: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const skip = (page - 1) * limit;
    return this.courseService.findCoursesByCreator(creatorAddress, skip, limit);
  }
}
