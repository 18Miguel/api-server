import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import Media from './Domains/Media';
import User from './Domains/User';
import UserMediaCatalog from './Domains/UserMediaCatalog';

@Module({
    imports: [
        TypeOrmModule.forFeature([Media]),
        TypeOrmModule.forFeature([UserMediaCatalog]),
        TypeOrmModule.forFeature([User]),
    ],
    exports: [
        TypeOrmModule.forFeature([Media]),
        TypeOrmModule.forFeature([UserMediaCatalog]),
        TypeOrmModule.forFeature([User]),
    ]
})
export default class CoreModule {}
