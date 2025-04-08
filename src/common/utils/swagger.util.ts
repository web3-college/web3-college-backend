import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import { BaseResponseDto } from '../models/swagger.model';

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
  const models: any[] = [BaseResponseDto];

  // 自动收集所有DTO
  try {
    // 需要收集DTO的目录列表
    const directories = [
      'src/auth/dto',
      // 未来可以添加更多目录
      // 'src/users/dto',
      // 'src/courses/dto',
    ];

    directories.forEach(dir => {
      if (fs.existsSync(dir)) {
        // 获取目录下所有文件
        const files = fs.readdirSync(dir);

        files.forEach(file => {
          // 只处理.ts文件且排除测试文件
          if (file.endsWith('.dto.ts') && !file.includes('.spec.') && !file.includes('.test.')) {
            try {
              // 动态导入模块
              const moduleRelativePath = `${dir}/${file}`.replace('src/', '../').replace('.ts', '');
              // 使用相对路径从src目录开始
              const module = require(moduleRelativePath);

              // 收集模块中所有导出的类
              Object.keys(module).forEach(key => {
                if (typeof module[key] === 'function' &&
                  /^[A-Z]/.test(key) && // 类名通常以大写字母开头
                  (key.endsWith('Dto') || key.endsWith('Entity') || key.endsWith('Model'))) {
                  models.push(module[key]);
                }
              });
            } catch (err) {
              console.warn(`无法导入DTO: ${dir}/${file}`, err);
            }
          }
        });
      }
    });
  } catch (err) {
    console.error('收集Swagger模型时出错:', err);
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
} 