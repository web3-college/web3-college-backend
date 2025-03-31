import DailyRotateFile from 'winston-daily-rotate-file';
import * as winston from 'winston';
import { Console } from 'winston/lib/winston/transports';
import { utilities } from 'nest-winston';

export const consoleTransports = new Console({
  format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.ms(),
        utilities.format.nestLike()
    ),
});

export function createDailyRotateTransport(level: string, filename: string) {
  return new DailyRotateFile({
    level,
    dirname: 'logs',
    filename: `${filename}-%DATE%.log`,
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    format: winston.format.combine(winston.format.timestamp(), winston.format.simple()),
  });
}
