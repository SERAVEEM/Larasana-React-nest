import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createDatabaseModule, User, Order, OrderItem, Payment, Product, ProductImage } from '../../../libs/shared/src';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [
    createDatabaseModule([User, Order, OrderItem, Payment, Product, ProductImage]),
    TypeOrmModule.forFeature([User, Order, OrderItem, Payment, Product, ProductImage]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminAppModule {}
