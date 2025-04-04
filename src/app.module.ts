import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from './common/config/config.module';
import { LogsModule } from './common/logger/logs.module';
import { DatabaseModule } from './database/database.module';
import { CourseModule } from './course/course.module';
import { CategoryModule } from './category/category.module';
import { UploadModule } from './upload/upload.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule,
    LogsModule,
    DatabaseModule,
    CourseModule,
    CategoryModule,
    UploadModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
