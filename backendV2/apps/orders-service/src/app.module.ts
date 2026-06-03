import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createDatabaseModule, Order, OrderItem, User, Product, ProductImage } from '../../../libs/shared/src';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [
    createDatabaseModule([Order, OrderItem, User, Product, ProductImage]),
    TypeOrmModule.forFeature([Order, OrderItem, User, Product, ProductImage]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersAppModule {}
