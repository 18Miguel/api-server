import { Module } from "@nestjs/common";
import InfrastructureModule from "src/Infrastructure/InfrastructureModule";
import RootController from "./Controllers/RootController";
import AuthController from "./Controllers/AuthController";
import UserController from "./Controllers/UserController";
import MediaCatalogController from "./Controllers/MediaCatalogController";

@Module({
    imports: [
        InfrastructureModule
    ],
    controllers: [
        RootController,
        AuthController,
        UserController,
        MediaCatalogController,
    ]
})
export default class AppModule {}
