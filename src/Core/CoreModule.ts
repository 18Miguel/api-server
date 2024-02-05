import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import MediaCatalog from './Domains/MediaCatalog';
import User from './Domains/User';
import YouTubeNotifier from './Domains/YouTubeNotifier';
import MediaCatalogUser from './Domains/MediaCatalogUser';

@Module({
    imports: [
        TypeOrmModule.forFeature([MediaCatalog]),
        TypeOrmModule.forFeature([MediaCatalogUser]),
        TypeOrmModule.forFeature([User]),
        TypeOrmModule.forFeature([YouTubeNotifier]),
    ],
    exports: [
        TypeOrmModule.forFeature([MediaCatalog]),
        TypeOrmModule.forFeature([MediaCatalogUser]),
        TypeOrmModule.forFeature([User]),
        TypeOrmModule.forFeature([YouTubeNotifier]),
    ]
})
export default class CoreModule {}
