import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  CreateUserDto,
  QueryUserDto,
  UpdateUserDto,
  UserListResponseDto,
  UserResponseDto,
  UpdateUserRolesDto
} from './dto';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiParam,
  ApiBody,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { apiResponse, apiSimpleResponse } from '@/common/models/swagger.model';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @ApiOperation({ summary: '创建用户', description: '创建新用户并关联默认用户角色' })
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse(apiResponse(UserResponseDto, '用户创建成功'))
  create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: '查询用户列表', description: '分页查询用户列表，支持按名称和地址模糊搜索' })
  @ApiOkResponse(apiResponse(UserListResponseDto, '查询成功'))
  findAll(@Query() query: QueryUserDto): Promise<UserListResponseDto> {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '查询用户详情', description: '根据用户ID查询用户详情' })
  @ApiParam({ name: 'id', description: '用户ID', example: 1 })
  @ApiOkResponse(apiResponse(UserResponseDto, '查询成功'))
  findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新用户', description: '根据用户ID更新用户信息' })
  @ApiParam({ name: 'id', description: '用户ID', example: 1 })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse(apiResponse(UserResponseDto, '更新成功'))
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<UserResponseDto> {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除用户', description: '根据用户ID删除用户' })
  @ApiParam({ name: 'id', description: '用户ID', example: 1 })
  @ApiOkResponse(apiResponse(UserResponseDto, '删除成功'))
  remove(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.remove(+id);
  }

  @Patch('/roles/:id')
  @ApiOperation({
    summary: '更新用户角色',
    description: '根据用户ID更新用户的角色列表，将替换该用户的所有现有角色'
  })
  @ApiParam({ name: 'id', description: '用户ID', example: 1 })
  @ApiBody({ type: UpdateUserRolesDto })
  @ApiOkResponse(apiResponse(UserResponseDto, '角色更新成功'))
  updateRoles(
    @Param('id') id: string,
    @Body() updateUserRolesDto: UpdateUserRolesDto
  ): Promise<UserResponseDto> {
    return this.usersService.updateRoles(+id, updateUserRolesDto);
  }
}
