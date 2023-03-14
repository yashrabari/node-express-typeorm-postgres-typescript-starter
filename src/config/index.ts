import { DataSource } from 'typeorm';

const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE_NAME,
    port: 5432,
    entities: ["src/app/models/*{.ts,.js}"],
    synchronize: true,
    logging: true
})

export {
    AppDataSource
}