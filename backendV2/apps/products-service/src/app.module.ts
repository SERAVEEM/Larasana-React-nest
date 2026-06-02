// app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createDatabaseModule, Product, ProductImage } from '../../../libs/shared/src';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [
    createDatabaseModule([Product, ProductImage]),
    TypeOrmModule.forFeature([Product, ProductImage]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsAppModule {}
