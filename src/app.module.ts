import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from './common/config/config.module';
import { LogsModule } from './common/logger/logs.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule,
    LogsModule,
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
