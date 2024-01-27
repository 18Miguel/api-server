import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import MediaCatalog from './Domains/MediaCatalog';
import User from './Domains/User';
import YouTubeNotifier from './Domains/YouTubeNotifier';

@Module({
    imports: [
        //TypeOrmModule.forFeature([Guild]),
        TypeOrmModule.forFeature([MediaCatalog]),
        TypeOrmModule.forFeature([User]),
        TypeOrmModule.forFeature([YouTubeNotifier]),
    ],
    exports: [
        //TypeOrmModule.forFeature([Guild]),
        TypeOrmModule.forFeature([MediaCatalog]),
        TypeOrmModule.forFeature([User]),
        TypeOrmModule.forFeature([YouTubeNotifier]),
    ]
})
export default class CoreModule {}
