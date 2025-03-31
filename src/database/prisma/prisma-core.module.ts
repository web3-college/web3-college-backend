import { Global, Module, OnApplicationShutdown, DynamicModule, Provider, Type } from "@nestjs/common";
import { PrismaModuleAsyncOptions, PrismaModuleOptions, PrismaOptionsFactory } from "./prisma-options.interface";
import { PrismaClient as PrismaClientPostgresql } from "prisma-postgresql";
import { getDBType, handleRetry } from "./prisma.utils";
import { PRISMA_CONNECTION_NAME, PRISMA_CONNECTIONS, PRISMA_MODULE_OPTIONS } from "./prisma.constants";
import { lastValueFrom, defer, catchError } from "rxjs";

@Module({})
@Global()
export class PrismaCoreModule implements OnApplicationShutdown {
  private static connections: Record<string, any> = {};
  onApplicationShutdown() {
    if(PrismaCoreModule.connections && Object.keys(PrismaCoreModule.connections).length>0) {
        for(const key of Object.keys(PrismaCoreModule.connections)) {
            const connection = PrismaCoreModule.connections[key];
            if(connection&&typeof connection.$disconnect == 'function') {
                connection.$disconnect();
            }
        }
    }
  }

  static forRoot(_options: PrismaModuleOptions) {
    const {
        url,
        options={}, 
        name,
        retryAttempts = 10,
        retryDelay = 3000,
        connectionFactory,
        connectionErrorFactory
    } = _options
    let newOptions = {
        datasourceUrl: url
    }
    if(!Object.keys(options).length) {
        newOptions = {
            ...newOptions,
            ...options
        }
    }
    const dbType = getDBType(url);
    let _prismaClient;
    if (dbType === 'postgresql') {
        _prismaClient = PrismaClientPostgresql
    }else {
        throw new Error(`Unsupported database type: ${dbType}`);
    }
    const providerName = name || PRISMA_CONNECTION_NAME;
    const prismaConnectionFactory = 
        connectionFactory || 
        (async (clientOptions) => await new _prismaClient(clientOptions))
    const prismaConnectionErrorFactory = connectionErrorFactory || (error => error)
    const prismaClientProvider: Provider = {
        provide: providerName,
        useFactory: async () => {
						if(this.connections[url]) {
							return this.connections[url];
						}
            const client = await prismaConnectionFactory(newOptions, _prismaClient);
						this.connections[url] = client;
            return lastValueFrom(
                defer(() => client.$connect().pipe(
                    handleRetry(retryAttempts, retryDelay),
                    catchError(error => {
                        throw prismaConnectionErrorFactory(error);
                    })
                ))
            ).then(() => client)
        }
    }

		const prismaConnectionsProvider: Provider = {
			provide: PRISMA_CONNECTIONS,
			useValue: this.connections
		}
    return {
        module: PrismaCoreModule,
        providers: [prismaClientProvider, prismaConnectionsProvider],
        exports: [prismaClientProvider, prismaConnectionsProvider],
    }
  }

  static forRootAsync(_options: PrismaModuleAsyncOptions): DynamicModule {
    const providerName = _options.name || PRISMA_CONNECTION_NAME;
    const prismaClientProvider: Provider = {
        provide: providerName,
        useFactory: async (prismaModuleOptions: PrismaModuleOptions) => {
            const {
                url,
                options={},
                retryAttempts = 10,
                retryDelay = 3000,
                connectionFactory,
                connectionErrorFactory
            } = prismaModuleOptions;
            let newOptions = {
                datasourceUrl: url
            }
            if(!Object.keys(options).length) {
                newOptions = {
                    ...newOptions,
                    ...options
                }
            }
            const dbType = getDBType(url);
            let _prismaClient;
            if(dbType === 'postgresql') {
                _prismaClient = PrismaClientPostgresql
            } else{
                throw new Error(`Unsupported database type: ${dbType}`);
            }

            const prismaConnectionFactory = 
                connectionFactory || 
                (async (clientOptions) => await new _prismaClient(clientOptions))
            const prismaConnectionErrorFactory = connectionErrorFactory || (error => error)
            return lastValueFrom(
                defer(async () => {
                    const url = newOptions.datasourceUrl;
                    if(this.connections[url]) {
                        return this.connections[url];
                    }
                    const client = await prismaConnectionFactory(
                        newOptions,
                        _prismaClient
                    )
                    this.connections[url] = client;
                    return client
                }).pipe(
                    handleRetry(retryAttempts, retryDelay),
                    catchError(error => {
                        throw prismaConnectionErrorFactory(error);
                    })
                )
            )
        },
        inject: [PRISMA_MODULE_OPTIONS]
    }
    const asyncProviders = this.createAsyncProviders(_options);
		const prismaConnectionsProvider: Provider = {
			provide: PRISMA_CONNECTIONS,
			useValue: this.connections
		}
    return {
        module: PrismaCoreModule,
        providers: [...asyncProviders, prismaClientProvider, prismaConnectionsProvider],
        exports: [prismaClientProvider, prismaConnectionsProvider]
    }
  }

  private static createAsyncProviders(options: PrismaModuleAsyncOptions) {
    if(options.useFactory || options.useExisting){
        return [this.createAsyncOptionsProvider(options)]
    }
    const useClass = options.useClass as Type<PrismaOptionsFactory>;
    return [
        this.createAsyncOptionsProvider(options),
        {
            provide: useClass,
            useClass
        }
    ]
  }

  private static createAsyncOptionsProvider(options: PrismaModuleAsyncOptions) {
    if(options.useFactory){
        return {
            provide: PRISMA_MODULE_OPTIONS,
            useFactory: options.useFactory,
            inject: options.inject || []
        }
    }
    const inject = [
        (options.useClass || options.useExisting) as Type<PrismaOptionsFactory>
    ]
    console.log('-------',inject);
    return {
        provide: PRISMA_MODULE_OPTIONS,
        useFactory: async (optionsFactory: PrismaOptionsFactory) => {
            const options = await optionsFactory.createPrismaModuleOptions();
            console.log('-------options',options);
            return options;
        },
        inject
    }
  }
}
