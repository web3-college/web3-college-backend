import { Handler, Context } from 'aws-lambda';
import serverlessExpress from '@codegenie/serverless-express';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { HttpAdapterHost } from '@nestjs/core';
import { AllExceptionFilter } from './common/filters/all-exception.filter';
import {
  ValidationPipe,
  VERSION_NEUTRAL,
  VersioningType,
} from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const express = require('express');

// 创建 Express 应用实例
const expressApp = express();

// 声明 server 变量
let cachedHandler: Handler;

// 异步函数，用于引导 NestJS 应用
async function bootstrapServer(): Promise<Handler> {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(expressApp),
  );

  const configService = app.get(ConfigService);
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

  // 使用 Winston 日志
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // 配置全局异常过滤器
  if (errorFilter) {
    app.useGlobalFilters(new AllExceptionFilter(app.get(HttpAdapterHost)));
  }

  // 配置全局拦截器
  app.useGlobalInterceptors(new ResponseInterceptor());

  // 配置跨域
  if (cors) {
    app.enableCors({
      origin: true,
      credentials: true,
    });
  }

  // 设置全局前缀
  app.setGlobalPrefix(prefix);

  // 配置 API 版本
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion:
      typeof versionStr === 'undefined' ? VERSION_NEUTRAL : version,
  });

  // 配置全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 只允许 DTO 中定义的字段，过滤掉多余字段
      transform: true, // 自动将请求参数转换为 DTO 中定义的类型
      transformOptions: {
        enableImplicitConversion: true, // 启用隐式转换
      },
    }),
  );

  await app.init();

  // 创建并返回 serverless-express 处理程序
  return serverlessExpress({ app: expressApp });
}

// Lambda 处理函数
export const handler: Handler = async (
  event: any,
  context: Context,
  callback?: any,
) => {
  if (!cachedHandler) {
    // 首次调用时初始化服务器
    cachedHandler = await bootstrapServer();
  }

  // 处理请求
  return cachedHandler(event, context, callback);
};
