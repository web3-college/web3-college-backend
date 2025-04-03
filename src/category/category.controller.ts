import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  // 创建分类
  @Post()
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.createCategory(createCategoryDto);
  }

  // 获取所有分类
  @Get()
  async findAllCategories(@Query('isActive') isActive?: boolean) {
    return this.categoryService.findAllCategories(isActive);
  }

  // 获取单个分类
  @Get(':id')
  async findCategoryById(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.findCategoryById(id);
  }

  // 更新分类
  @Put(':id')
  async updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.updateCategory(id, updateCategoryDto);
  }

  // 删除分类
  @Delete(':id')
  async deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.deleteCategory(id);
  }

  // 根据分类获取课程
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