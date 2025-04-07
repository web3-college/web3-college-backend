import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import session from 'express-session';

@Module({
  imports: [ConfigModule],
})
export class SessionModule implements NestModule {
  constructor(private readonly configService: ConfigService) {}
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        session({
          secret: this.configService.get('SESSION_SECRET') || 'web3-college',
          resave: true,
          saveUninitialized: true,
          cookie: {
            secure: process.env.NODE_ENV === 'production', // 生产环境使用 HTTPS
            httpOnly: true, // 防止 XSS
            maxAge: 24 * 60 * 60 * 1000, // 24 小时
          },
        }),
      )
      .forRoutes('*'); // 应用于所有路由
  }
}
