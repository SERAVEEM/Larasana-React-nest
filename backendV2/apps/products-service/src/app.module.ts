// app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createDatabaseModule, Product, ProductImage, User } from '../../../libs/shared/src';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [
    createDatabaseModule([Product, ProductImage, User]),
    TypeOrmModule.forFeature([Product, ProductImage, User]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsAppModule {}
