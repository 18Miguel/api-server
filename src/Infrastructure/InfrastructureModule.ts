import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { ScheduleModule } from '@nestjs/schedule';
import { Mapper } from 'ts-simple-automapper';
import { CacheModule } from '@nestjs/cache-manager';
import typeorm from './Settings/typeorm';
import CoreModule from 'src/Core/CoreModule';
import AuthService from './Services/Services/AuthService';
import ApiTokenGuard from './Guards/ApiTokenGuard';
import RoleGuard from './Guards/RoleGuard';
import RootService from './Services/Services/RootService';
import MediaService from './Services/Services/MediaService';
import MediaStore from './Services/Stores/MediaStore';
import UserStore from './Services/Stores/UserStore';
import UserMediaCatalogStore from './Services/Stores/UserMediaCatalogStore';
import UserSubscriber from './Subscribers/UserSubscriber';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [typeorm],
        }),
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) =>
                configService.get('typeorm'),
            dataSourceFactory: async (options?: DataSourceOptions) => {
                if (!options) {
                    throw new Error('Invalid options passed');
                }
                return addTransactionalDataSource(new DataSource(options));
            }
        }),
        CacheModule.registerAsync({
            isGlobal: true,
            useFactory: () => ({
                ttl: 1000 * 60 * 1.5,
            }),
        }),
        ScheduleModule.forRoot(),
        CoreModule,
        /* GraphQLModule.forRoot<ApolloDriverConfig>({
            driver: ApolloDriver,
            autoSchemaFile: true,
        }), */
    ],
    providers: [
        UserSubscriber,
        UserMediaCatalogStore,
        Mapper, {
            provide: 'Mapper',
            useExisting: Mapper
        },
        ApiTokenGuard, {
            provide: APP_GUARD,
            useClass: RoleGuard,
        },
        RootService, {
            provide: 'IRootService',
            useExisting: RootService
        },
        AuthService, {
            provide: 'IAuthService',
            useExisting: AuthService
        },
        MediaService, {
            provide: 'IMediaService',
            useExisting: MediaService
        },
        MediaStore, {
            provide: 'IMediaStore',
            useExisting: MediaStore
        },
        //MediaResolver,
        UserMediaCatalogStore, {
            provide: 'IUserMediaCatalogStore',
            useExisting: UserMediaCatalogStore
        },
        UserStore, {
            provide: 'IUserStore',
            useExisting: UserStore
        },
    ],
    exports: [
        'Mapper',
        ApiTokenGuard,
        'IRootService',
        'IAuthService',
        'IMediaService',
        'IUserStore'
    ]
})
export default class InfrastructureModule {}
