import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as bcrypt from 'bcrypt';
import { StorageDriver, initializeTransactionalContext } from 'typeorm-transactional';
import AppModule from './AppModule';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { dataSource } from 'src/Infrastructure/Settings/typeorm';
import User from 'src/Core/Domains/User';
import UserRoles from 'src/Core/Types/Enums/UserRoles';
import { randomBytes } from 'crypto';

async function databaseSeed() {
    const userRepository = (await dataSource.initialize()).getRepository(User);
    const userAdmin: User = {
        id: 1,
        username: 'admin',
        password: await bcrypt.hash('admin', 5),
        role: UserRoles.Admin,
        apiToken: randomBytes(32).toString('hex'),
        apiTokenCreateAt: new Date(),
        mediaCatalogList: []
    };

    try {
        const userExist = await userRepository.findOneBy({ id: userAdmin.id });
        if (!userExist) {
            await userRepository.insert(userAdmin);
        }
    } catch (ignored) {}
}

export async function Bootstrap(): Promise<INestApplication> {
    initializeTransactionalContext({ storageDriver: StorageDriver.AUTO });
    
    const app = await NestFactory.create(AppModule);
    const config = new DocumentBuilder()
        .addBearerAuth()
        .setTitle('API Server 🐈')
        .setDescription('Custom API Server')
        .setVersion('1.0')
        .addTag('Auth').addTag("Users").addTag('Media Catalog')
        .build();
    const document = SwaggerModule.createDocument(app, config);

    app.enableCors();
    app.useGlobalPipes(new ValidationPipe());
    SwaggerModule.setup('swagger', app, document);

    await databaseSeed();
    
    return app;
}
