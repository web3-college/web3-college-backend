import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { createDailyRotateTransport } from './createRotateTransport';
import { consoleTransports } from './createRotateTransport';


@Module({
  imports: [
    WinstonModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const logOn = configService.get('LOG_ON', false);
        return {
          transports: [
            consoleTransports,
            ...(logOn ? [
                createDailyRotateTransport('info', 'application'),
                createDailyRotateTransport('error', 'error'),
            ] : [])],
        };
      },
    }),
  ],
})
export class LogsModule {}