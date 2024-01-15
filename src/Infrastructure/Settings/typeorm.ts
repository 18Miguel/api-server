import { registerAs } from '@nestjs/config';
import { join } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';

const config = {
    type: 'sqlite',
    database: 'database.sqlite',
    synchronize: true,
    logging: true,
    entities: [join(__dirname, '/../../**/Core/Domains/*{.ts,.js}')],
    migrations: [
        join(__dirname, '/../../**/Infrastructure/Migrations/*{.ts,.js}'),
    ],
    migrationsRun: true,
};

export default registerAs('typeorm', () => config);
export const dataSource = new DataSource(config as DataSourceOptions);
