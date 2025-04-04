import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AllExceptionFilter } from './common/filters/all-exception.filter';
import {
  ValidationPipe,
  VERSION_NEUTRAL,
  VersioningType,
} from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get('PORT', 3001);
  // 异常过滤器
  const errorFilter = configService.get('ERROR_FILTER');
  // 跨域
  const cors = configService.get('CORS', false);
  // 前缀
  const prefix = configService.get('PREFIX', '/api');
  // 版本
  const versionStr = configService.get('VERSION');
  let version = [versionStr];
  if (versionStr && versionStr.includes(',')) {
    version = versionStr.split(',');
  }

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  if (errorFilter) {
    app.useGlobalFilters(new AllExceptionFilter(app.get(HttpAdapterHost)));
  }
  app.useGlobalInterceptors(new ResponseInterceptor());
  // 跨域
  if (cors) {
    app.enableCors();
  }
  // 前缀
  app.setGlobalPrefix(prefix);
  // 版本
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion:
      typeof versionStr === 'undefined' ? VERSION_NEUTRAL : version,
  });
  // 验证
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 只允许 DTO（数据传输对象）中定义的字段，过滤掉多余字段
      transform: true, // 自动将请求参数转换为 DTO 中定义的类型
      transformOptions: {
        enableImplicitConversion: true, // 自动将请求参数转换为 DTO 中定义的类型
      },
    }),
  );
  
  // 配置Swagger文档
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Web3 College API')
    .addTag('course', '课程相关API')
    .addTag('category', '分类相关API')
    .addTag('upload', '上传相关API')
    .build();
  
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document);
  fs.writeFileSync('./openapi-spec.json', JSON.stringify(document));

  await app.listen(port);
}
bootstrap();
