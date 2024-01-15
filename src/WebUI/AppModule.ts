import { Module } from "@nestjs/common";
import RootController from "./Controllers/RootController";
import MediaCatalogController from "./Controllers/MediaCatalogController";
import InfrastructureModule from "src/Infrastructure/InfrastructureModule";
import GuildController from "./Controllers/GuildController";

@Module({
    imports: [
        InfrastructureModule
    ],
    controllers: [
        RootController,
        MediaCatalogController,
        GuildController
    ]
})
export default class AppModule {}
