import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createDatabaseModule, User, Order, OrderItem, Payment, Product } from '../../../libs/shared/src';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [
    createDatabaseModule([User, Order, OrderItem, Payment, Product]),
    TypeOrmModule.forFeature([User, Order, OrderItem, Payment, Product]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminAppModule {}
