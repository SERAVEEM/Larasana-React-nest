import { DynamicModule } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

export function createDatabaseModule(entities: EntityClassOrSchema[]): DynamicModule {
  return TypeOrmModule.forRoot({
    type: 'mysql',
    host:     process.env.DB_HOST     ?? 'localhost',
    port:     Number(process.env.DB_PORT ?? 3306),
    username: process.env.DB_USERNAME ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME     ?? 'larasana_db',
    entities,
    synchronize: false,
    logging: process.env.NODE_ENV === 'development',
    timezone: '+07:00',
  } as TypeOrmModuleOptions);
}
