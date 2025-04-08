import { ResponseModel } from '../interceptors/response.interceptor';
import { Type } from '@nestjs/common';
import { ApiResponseOptions, getSchemaPath } from '@nestjs/swagger';

/**
 * Swagger文档用基础响应模型
 */
export class BaseResponseDto<T> extends ResponseModel<T> { }

/**
 * 创建一个API响应选项，用于@ApiResponse装饰器
 * @param dataType 数据类型(DTO类)
 * @param description 描述
 * @param status HTTP状态码
 * @returns ApiResponseOptions 可用于@ApiResponse和@ApiOkResponse等装饰器
 * 
 * @example
 * // 在控制器中使用:
 * @ApiOkResponse(apiResponse(UserDto, '获取用户信息成功'))
 * @Get('user')
 * getUserInfo() {...}
 * 
 * @note 需要确保dataType已在main.ts的extraModels中注册
 */
export function apiResponse<T>(
  dataType: Type<T>,
  description = '请求成功',
  status = 200
): ApiResponseOptions {
  return {
    status,
    description,
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: status },
        msg: { type: 'string', example: 'success' },
        data: { type: 'object', oneOf: [{ $ref: getSchemaPath(dataType) }] }
      }
    }
  };
}

/**
 * 创建一个API响应选项，直接内联DTO的属性定义（不使用引用）
 * @param properties 属性定义对象
 * @param description 描述
 * @param status HTTP状态码
 * @returns ApiResponseOptions 可用于@ApiResponse和@ApiOkResponse等装饰器
 * 
 * @example
 * // 在控制器中使用:
 * @ApiOkResponse(apiInlineResponse({
 *   name: { type: 'string', example: '张三' },
 *   age: { type: 'number', example: 18 }
 * }, '获取用户信息成功'))
 * @Get('user')
 * getUserInfo() {...}
 */
export function apiInlineResponse(
  properties: Record<string, any>,
  description = '请求成功',
  status = 200
): ApiResponseOptions {
  return {
    status,
    description,
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: status },
        msg: { type: 'string', example: 'success' },
        data: {
          type: 'object',
          properties: properties
        }
      }
    }
  };
}

/**
 * 创建一个简单类型(如string, number, boolean)或基本对象的API响应选项
 * @param example 示例数据
 * @param description 描述
 * @param status HTTP状态码
 * @returns ApiResponseOptions 可用于@ApiResponse和@ApiOkResponse等装饰器
 * 
 * @example
 * // 在控制器中使用:
 * @ApiOkResponse(apiSimpleResponse(true, '删除成功'))
 * @Delete('user/:id')
 * deleteUser() {...}
 * 
 * @example
 * // 使用对象示例:
 * @ApiOkResponse(apiSimpleResponse({count: 10, success: true}, '统计成功'))
 * @Get('stats')
 * getStats() {...}
 */
export function apiSimpleResponse(
  example: any = {},
  description = '请求成功',
  status = 200
): ApiResponseOptions {
  // 根据示例值类型确定data字段的定义
  let dataSchema: any;

  if (example === null) {
    dataSchema = { type: 'null', example: null };
  } else if (typeof example === 'string') {
    dataSchema = { type: 'string', example };
  } else if (typeof example === 'number') {
    dataSchema = { type: 'number', example };
  } else if (typeof example === 'boolean') {
    dataSchema = { type: 'boolean', example };
  } else if (Array.isArray(example)) {
    dataSchema = {
      type: 'array',
      items: { type: 'object' },
      example
    };
  } else {
    dataSchema = {
      type: 'object',
      example
    };
  }

  return {
    status,
    description,
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: status },
        msg: { type: 'string', example: 'success' },
        data: dataSchema
      }
    }
  };
} 