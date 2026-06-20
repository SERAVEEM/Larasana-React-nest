import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order, OrderItem, Payment, Product, Address, ShippingMethod, User } from '../../../libs/shared/src';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { MidtransService } from './midtrans.service';
import { ShippingModule } from './shipping.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Payment, Product, Address, ShippingMethod, User]),
    ShippingModule,
  ],
  controllers: [OrdersController, PaymentsController],
  providers: [OrdersService, PaymentsService, MidtransService],
  exports: [OrdersService, PaymentsService, MidtransService],
})
export class OrdersModule {}
