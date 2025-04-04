import { Inject, Injectable } from '@nestjs/common';
import {
  PrismaModuleOptions,
  PrismaOptionsFactory,
} from './prisma-options.interface';
import { REQUEST } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaConfigService implements PrismaOptionsFactory {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly configService: ConfigService,
  ) {}
  createPrismaModuleOptions():
    | PrismaModuleOptions
    | Promise<PrismaModuleOptions> {
    const headers = this.request.headers;
    const tenantId = headers['x-tenant-id'] || 'default';
    console.log('-------tenantId', tenantId);
    if (tenantId === 'prisma1') {
      console.log('-------mysql');
      return { url: 'mysql://root:example@localhost:3307/testdb' };
    } else if (tenantId === 'prisma2') {
      console.log('-------postgresql');
      return { url: 'postgresql://pguser:example@localhost:5432/testdb' };
    } else {
      return { url: this.configService.get('DATABASE_URL') };
    }
  }
}
