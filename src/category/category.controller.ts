import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiResponse, ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto, CategoryListResponseDto, QueryCategoryDto, QueryCategoryWithoutPaginationDto } from './dto';
import { apiResponse } from '@/common/models/swagger.model';
import { RolePermissionGuard } from '@/common/guards/role-permission.guard';
import { Permission } from '@/common/decorators/role-permission.decorator';
import { Create, Read, Update, Delete as Remove } from '@/common/decorators/role-permission.decorator'
@ApiTags('category')
@UseGuards(RolePermissionGuard)
@Permission('category')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) { }

  // 创建分类
  @ApiOperation({ summary: '创建分类', description: '创建一个新的课程分类' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({ status: 201, description: '分类创建成功' })
  @ApiResponse({ status: 400, description: '参数验证失败' })
  @Create()
  @Post()
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.createCategory(createCategoryDto);
  }

  // 获取所有分类
  @ApiOperation({ summary: '获取所有分类', description: '获取所有课程分类列表，支持分页和名称搜索' })
  @ApiOkResponse(apiResponse(CategoryListResponseDto, '获取分类列表成功'))
  @Get()
  async findAllCategories(@Query() query: QueryCategoryDto): Promise<CategoryListResponseDto> {
    return this.categoryService.findAllCategories(query);
  }

  // 获取所有分类（不分页）
  @ApiOperation({ summary: '获取所有分类（不分页）', description: '获取所有课程分类列表，不分页，可按激活状态和名称筛选，适用于下拉菜单等场景' })
  @ApiOkResponse(apiResponse(CategoryListResponseDto, '获取分类列表成功'))
  @Get('list-all')
  async findAllCategoriesWithoutPagination(
    @Query() query: QueryCategoryWithoutPaginationDto,
  ) {
    const { isActive, name } = query;
    console.log('isActive', isActive);
    console.log('name', name);

    return this.categoryService.findAllCategoriesWithoutPagination(isActive, name);
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

  // 根据分类获取课程
  @ApiOperation({ summary: '获取分类下的课程', description: '获取特定分类下的所有课程' })
  @ApiResponse({ status: 200, description: '获取课程列表成功' })
  @ApiResponse({ status: 404, description: '分类不存在' })
  @Get(':id/courses')
  async findCoursesByCategory(
    @Param('id', ParseIntPipe) categoryId: number,
    @Query() query: QueryCategoryDto,
  ) {
    const { page = 1, pageSize = 10, isActive, name } = query;
    const skip = (page - 1) * pageSize;
    return this.categoryService.findCoursesByCategory(categoryId, skip, pageSize, isActive, name);
  }

  // 更新分类
  @ApiOperation({ summary: '更新分类', description: '通过ID更新分类信息' })
  @ApiParam({ name: 'id', description: '分类ID' })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse({ status: 200, description: '分类更新成功' })
  @ApiResponse({ status: 404, description: '分类不存在' })
  @Update()
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
  @Remove()
  @Delete(':id')
  async deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.deleteCategory(id);
  }
} 