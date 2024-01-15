import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import typeorm from './Settings/typeorm';
import CoreModule from 'src/Core/CoreModule';
import SocketGateway from './Adapters/SocketGateway';
import RootService from './Services/Services/RootService';
import MediaCatalogService from './Services/Services/MediaCatalogService';
import MediaCatalogStore from './Services/Stores/MediaCatalogStore';
import GuildStore from './Services/Stores/GuildStore';

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
        SocketGateway,
        RootService,
        MediaCatalogService,
        MediaCatalogStore,
        GuildStore,
    ],
    exports: [
        RootService,
        MediaCatalogService,
        GuildStore,
    ]
})
export default class InfrastructureModule {}
