import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AllExceptionFilter } from './common/filters/all-exception.filter';
import { ValidationPipe, VERSION_NEUTRAL, VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get('PORT', 3001);
  const errorFilter = configService.get('ERROR_FILTER');
  const cors = configService.get('CORS', false);
  const prefix = configService.get('PREFIX', '/api');
  const versionStr = configService.get('VERSION');
  let version = [versionStr];
  if (versionStr && versionStr.includes(',')) {
    version = versionStr.split(',');
  }

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  if (errorFilter) {
    app.useGlobalFilters(new AllExceptionFilter(app.get(HttpAdapterHost)));
  }
  if (cors) {
    app.enableCors();
  }
  app.setGlobalPrefix(prefix);
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: typeof versionStr === 'undefined' ? VERSION_NEUTRAL : version,
  });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    }
  }));
  await app.listen(port);
}
bootstrap();
