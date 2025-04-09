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
import { RoleService } from './role.service';
import {
  CreateRoleDto,
  UpdateRoleDto,
  QueryRoleDto,
  RoleResponseDto,
  RoleListResponseDto
} from './dto';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { apiInlineResponse } from '../common/models/swagger.model';
import { Permission, Create, Read, Update, Delete as Remove } from '@/common/decorators/role-permission.decorator';
import { RolePermissionGuard } from '@/common/guards/role-permission.guard';

@ApiTags('role')
@UseGuards(RolePermissionGuard)
@Permission('role')
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) { }

  @Post()
  @ApiOperation({ summary: '创建角色' })
  @ApiOkResponse(apiInlineResponse({
    id: 1,
    name: 'admin',
    description: '系统管理员',
    permissions: [
      {
        id: 1,
        name: 'permission:read',
        action: 'read',
        description: '查看权限'
      }
    ]
  }, '创建成功'))
  @Create()
  async create(@Body() createRoleDto: CreateRoleDto): Promise<RoleResponseDto> {
    return this.roleService.create(createRoleDto);
  }

  @Get()
  @ApiOperation({ summary: '获取角色列表' })
  @ApiOkResponse(apiInlineResponse({
    items: [
      {
        id: 1,
        name: 'admin',
        description: '系统管理员',
        permissions: [
          {
            id: 1,
            name: 'permission:read',
            action: 'read',
            description: '查看权限'
          }
        ]
      }
    ],
    total: 1,
    page: 1,
    pageSize: 10
  }, '查询成功'))
  @Read()
  async findAll(@Query() query: QueryRoleDto): Promise<RoleListResponseDto> {
    return this.roleService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取指定角色' })
  @ApiOkResponse(apiInlineResponse({
    id: 1,
    name: 'admin',
    description: '系统管理员',
    permissions: [
      {
        id: 1,
        name: 'permission:read',
        action: 'read',
        description: '查看权限'
      }
    ]
  }, '查询成功'))
  @Read()
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<RoleResponseDto> {
    return this.roleService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新角色' })
  @ApiOkResponse(apiInlineResponse({
    id: 1,
    name: 'admin',
    description: '更新后的描述',
    permissions: [
      {
        id: 1,
        name: 'permission:read',
        action: 'read',
        description: '查看权限'
      }
    ]
  }, '更新成功'))
  @Update()
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<RoleResponseDto> {
    return this.roleService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除角色' })
  @ApiOkResponse(apiInlineResponse({
    id: 1,
    name: 'admin',
    description: '系统管理员',
    permissions: []
  }, '删除成功'))
  @Remove()
  async remove(@Param('id', ParseIntPipe) id: number): Promise<RoleResponseDto> {
    return this.roleService.remove(id);
  }
}
