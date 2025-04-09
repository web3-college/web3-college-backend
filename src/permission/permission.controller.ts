import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { PermissionService } from './permission.service';
import {
  CreatePermissionDto,
  UpdatePermissionDto,
  QueryPermissionDto,
  PermissionResponseDto,
  PermissionListResponseDto
} from './dto';
import { ApiTags, ApiOperation, ApiResponse, ApiOkResponse } from '@nestjs/swagger';
import { apiInlineResponse } from '../common/models/swagger.model';
import { Permission, Create, Read, Update, Delete as Remove } from '@/common/decorators/role-permission.decorator'
import { RolePermissionGuard } from '@/common/guards/role-permission.guard';

@ApiTags('permission')
@UseGuards(RolePermissionGuard)
@Permission('permission')
@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) { }

  @Post()
  @ApiOperation({ summary: '创建权限' })
  @ApiOkResponse(apiInlineResponse({
    id: 1,
    name: 'create:course',
    action: 'create',
    description: '创建课程的权限'
  }, '创建成功'))
  @Create()
  async create(
    @Body() createPermissionDto: CreatePermissionDto,
  ): Promise<PermissionResponseDto> {
    return this.permissionService.create(createPermissionDto);
  }

  @Get()
  @ApiOperation({ summary: '获取权限列表' })
  @ApiOkResponse(apiInlineResponse({
    items: [
      {
        id: 1,
        name: 'create:course',
        action: 'create',
        description: '创建课程的权限'
      }
    ],
    total: 1,
    page: 1,
    pageSize: 10
  }, '查询成功'))
  @Read()
  async findAll(
    @Query() query: QueryPermissionDto,
  ): Promise<PermissionListResponseDto> {
    return this.permissionService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取指定权限' })
  @ApiOkResponse(apiInlineResponse({
    id: 1,
    name: 'create:course',
    action: 'create',
    description: '创建课程的权限'
  }, '查询成功'))
  @Read()
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PermissionResponseDto> {
    return this.permissionService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新权限' })
  @ApiOkResponse(apiInlineResponse({
    id: 1,
    name: 'create:course',
    action: 'create',
    description: '更新后的权限描述'
  }, '更新成功'))
  @Update()
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ): Promise<PermissionResponseDto> {
    return this.permissionService.update(id, updatePermissionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除权限' })
  @ApiOkResponse(apiInlineResponse({
    id: 1,
    name: 'create:course',
    action: 'create',
    description: '创建课程的权限'
  }, '删除成功'))
  @Remove()
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PermissionResponseDto> {
    return this.permissionService.remove(id);
  }
}
