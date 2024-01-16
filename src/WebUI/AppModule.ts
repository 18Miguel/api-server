import { Module } from "@nestjs/common";
import RootController from "./Controllers/RootController";
import MediaCatalogController from "./Controllers/MediaCatalogController";
import InfrastructureModule from "src/Infrastructure/InfrastructureModule";
import GuildController from "./Controllers/GuildController";
import UserController from "./Controllers/UserController";

@Module({
    imports: [
        InfrastructureModule
    ],
    controllers: [
        RootController,
        MediaCatalogController,
        GuildController,
        UserController
    ]
})
export default class AppModule {}
