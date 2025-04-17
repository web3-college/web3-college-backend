import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import session from 'express-session';
import { PrismaModule } from '../database/prisma/prisma.module';
import pgConnect from 'connect-pg-simple';

@Module({
  imports: [ConfigModule, PrismaModule],
})
export class SessionModule implements NestModule {
  constructor(
    private readonly configService: ConfigService,
  ) { }

  configure(consumer: MiddlewareConsumer) {
    const PgStore = pgConnect(session);
    const dbConfig = {
      conString: this.configService.get('DATABASE_URL'),
      tableName: 'session',
      // 每隔一小时清理一次过期会话
      pruneSessionInterval: 60 * 60
    };

    consumer
      .apply(
        session({
          store: new PgStore(dbConfig),
          secret: this.configService.get('SESSION_SECRET') || 'web3-college',
          resave: false,
          saveUninitialized: false,
          cookie: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true, // 防止 XSS
            maxAge: 24 * 60 * 60 * 1000, // 24 小时
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
          },
        }),
      )
      .forRoutes('*'); // 应用于所有路由
  }
}
