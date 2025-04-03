import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
const envFilePath = [`.env.${process.env.NODE_ENV || 'development'}`, '.env'];

const schema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production').default('development'),
  PORT: Joi.number().default(3001),
  DATABASE_URL: Joi.string().uri(),
  DIRECT_URL: Joi.string().uri(),
});

@Module({
  imports: [NestConfigModule.forRoot({ isGlobal: true, envFilePath, validationSchema: schema })],
})
export class ConfigModule {}
