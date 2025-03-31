import { Module } from '@nestjs/common';
import { getEnvs } from '../utils/get-envs';
import { toBoolean } from '../utils/format';
import { PrismaCommonModule } from './prisma/prisma-common.module';
const parsedConfig = getEnvs();
console.log('🚀 ~ parsedConfig:', parsedConfig);
const tenantMode = toBoolean(parsedConfig['TENANT_MODE']);
const tenantDBType = parsedConfig['TENANT_DB_TYPE'].split(',') || [];

const imports = tenantMode
  ? tenantDBType.map((type) => {
      switch (type) {
        case 'prisma':
          return PrismaCommonModule;
      }
    })
  : [PrismaCommonModule];

@Module({
    imports,
    providers: [],
    exports: [],
})
export class DatabaseModule {}
