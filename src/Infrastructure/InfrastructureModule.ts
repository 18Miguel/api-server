import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import typeorm from './Settings/typeorm';
import CoreModule from 'src/Core/CoreModule';
import AuthService from './Services/Services/AuthService';
import RootService from './Services/Services/RootService';
import MediaCatalogService from './Services/Services/MediaCatalogService';
import MediaCatalogStore from './Services/Stores/MediaCatalogStore';
import UserStore from './Services/Stores/UserStore';
import ApiKeyGuard from './Guards/ApiKeyGuard';
import RoleGuard from './Guards/RoleGuard';

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
        }),
        CoreModule,
        ScheduleModule.forRoot(),
    ],
    providers: [
        ApiKeyGuard,
        {
            provide: APP_GUARD,
            useClass: RoleGuard,
        },
        RootService,
        AuthService,
        MediaCatalogService,
        MediaCatalogStore,
        UserStore
    ],
    exports: [
        ApiKeyGuard,
        RootService,
        AuthService,
        MediaCatalogService,
        UserStore,
    ]
})
export default class InfrastructureModule {}
