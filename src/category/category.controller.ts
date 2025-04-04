import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiBody, ApiResponse } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('category')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  // 创建分类
  @ApiOperation({ summary: '创建分类', description: '创建一个新的课程分类' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({ status: 201, description: '分类创建成功' })
  @ApiResponse({ status: 400, description: '参数验证失败' })
  @Post()
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.createCategory(createCategoryDto);
  }

  // 获取所有分类
  @ApiOperation({ summary: '获取所有分类', description: '获取所有课程分类列表' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: '是否只获取激活的分类' })
  @ApiResponse({ status: 200, description: '获取分类列表成功' })
  @Get()
  async findAllCategories(@Query('isActive') isActive?: boolean) {
    return this.categoryService.findAllCategories(isActive);
  }

  // 获取单个分类
  @ApiOperation({ summary: '获取单个分类', description: '通过ID获取特定分类' })
  @ApiParam({ name: 'id', description: '分类ID' })
  @ApiResponse({ status: 200, description: '获取分类成功' })
  @ApiResponse({ status: 404, description: '分类不存在' })
  @Get(':id')
  async findCategoryById(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.findCategoryById(id);
  }

  // 更新分类
  @ApiOperation({ summary: '更新分类', description: '通过ID更新分类信息' })
  @ApiParam({ name: 'id', description: '分类ID' })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse({ status: 200, description: '分类更新成功' })
  @ApiResponse({ status: 404, description: '分类不存在' })
  @Put(':id')
  async updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.updateCategory(id, updateCategoryDto);
  }

  // 删除分类
  @ApiOperation({ summary: '删除分类', description: '通过ID删除分类' })
  @ApiParam({ name: 'id', description: '分类ID' })
  @ApiResponse({ status: 200, description: '分类删除成功' })
  @ApiResponse({ status: 404, description: '分类不存在' })
  @Delete(':id')
  async deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.deleteCategory(id);
  }

  // 根据分类获取课程
  @ApiOperation({ summary: '获取分类下的课程', description: '获取特定分类下的所有课程' })
  @ApiParam({ name: 'id', description: '分类ID' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量', example: 10 })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: '是否只获取激活的课程' })
  @ApiResponse({ status: 200, description: '获取课程列表成功' })
  @ApiResponse({ status: 404, description: '分类不存在' })
  @Get(':id/courses')
  async findCoursesByCategory(
    @Param('id', ParseIntPipe) categoryId: number,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('isActive') isActive?: boolean,
  ) {
    const skip = (page - 1) * limit;
    return this.categoryService.findCoursesByCategory(categoryId, skip, limit, isActive);
  }
} 