import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import { ResponseModel } from '../interceptors/response.interceptor';
import * as authDto from '@/auth/dto/index';
import * as userDto from '@/users/dto/index';
import * as courseDto from '@/course/dto/index';
import * as roleDto from '@/role/dto/index';
import * as permissionDto from '@/permission/dto/index';
import * as categoryDto from '@/category/dto/index';
import * as uploadDto from '@/upload/dto/index';

/**
 * Swagger文档配置接口
 */
export interface SwaggerConfigOptions {
  title: string;
  description?: string;
  version?: string;
  tags?: Array<{ name: string, description: string }>;
  docPath?: string;
  saveToFile?: boolean;
  outputFilePath?: string;
}

/**
 * 收集需要在Swagger中注册的所有模型
 * @returns 模型数组
 */
export function collectModels(): any[] {
  // 基础响应模型总是需要包含
  const models: any[] = [ResponseModel];

  try {
    // 收集所有导入模块中的DTO
    const dtoModules = {
      authDto,
      userDto,
      courseDto,
      roleDto,
      permissionDto,
      categoryDto,
      uploadDto
    };

    // 遍历每个模块并添加其导出的所有DTO类
    for (const [moduleName, module] of Object.entries(dtoModules)) {
      for (const key in module) {
        if (module[key] && typeof module[key] === 'function') {
          models.push(module[key]);
        }
      }
    }
  } catch (err) {
    console.error('导入DTO时出错:', err);
  }

  return models;
}

/**
 * 设置Swagger文档
 * @param app NestJS应用实例
 * @param options Swagger配置选项
 * @returns OpenAPI对象
 */
export function setupSwagger(
  app: INestApplication,
  options: SwaggerConfigOptions,
): OpenAPIObject {
  // 构建文档
  const builder = new DocumentBuilder()
    .setTitle(options.title)
    .setDescription(options.description || '')
    .setVersion(options.version || '1.0');

  // 添加标签
  if (options.tags && options.tags.length > 0) {
    options.tags.forEach(tag => {
      builder.addTag(tag.name, tag.description);
    });
  }

  const config = builder.build();

  try {
    // 收集所有需要在Swagger中注册的模型
    const models = collectModels();

    // 创建文档
    const document = SwaggerModule.createDocument(app, config, {
      extraModels: models,
    });

    // 设置Swagger UI路径
    SwaggerModule.setup(options.docPath || 'api-docs', app, document);

    // 将生成的规范保存到文件
    if (options.saveToFile) {
      const outputPath = options.outputFilePath || './openapi-spec.json';
      fs.writeFileSync(outputPath, JSON.stringify(document, null, 2));
    }

    return document;
  } catch (error) {
    console.error('设置Swagger文档时出错:', error);
    // 失败时也返回一个最小可用的文档
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(options.docPath || 'api-docs', app, document);
    return document;
  }
} 