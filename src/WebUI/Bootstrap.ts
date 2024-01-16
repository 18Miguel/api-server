import { NestFactory } from '@nestjs/core';
import AppModule from './AppModule';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export async function Bootstrap(): Promise<INestApplication> {
    const app = await NestFactory.create(AppModule);
    const config = new DocumentBuilder()
        .setTitle('API Server 🐈')
        .setDescription('Custom API Server')
        .setVersion('1.0')
        .addTag('Media Catalog').addTag('Discord Guilds').addTag('Users')
        .build();
    const document = SwaggerModule.createDocument(app, config);

    app.enableCors();
    SwaggerModule.setup('swagger', app, document);
    
    return app;
}
