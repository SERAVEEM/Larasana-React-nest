import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckoutService } from './checkout.service';
import { CheckoutController } from './checkout.controller';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Product } from '../products/entities/product.entity';
import { AddressesModule } from '../addresses/addresses.module';
import { ShippingModule } from '../shipping/shipping.module';
import { MidtransService } from '../payments/midtrans.service';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Payment, Product]),
    AddressesModule,
    ShippingModule,
    OrdersModule,
  ],
  controllers: [CheckoutController],
  providers: [CheckoutService, MidtransService],
})
export class CheckoutModule {}
