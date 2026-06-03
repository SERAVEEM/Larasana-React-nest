import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  createDatabaseModule,
  Order, OrderItem, Payment, Product, Address, ShippingMethod, User, ProductImage,
  SERVICES,
} from '../../../libs/shared/src';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { MidtransService } from './midtrans.service';

@Module({
  imports: [
    createDatabaseModule([Order, OrderItem, Payment, Product, Address, ShippingMethod, User, ProductImage]),
    TypeOrmModule.forFeature([Order, OrderItem, Payment, Product, Address, ShippingMethod, User, ProductImage]),
    // Payments service perlu akses ke addresses dan shipping service
    ClientsModule.register([
      {
        name: SERVICES.ADDRESSES,
        transport: Transport.TCP,
        options: { host: '127.0.0.1', port: Number(process.env.ADDRESSES_SERVICE_PORT ?? 3008) },
      },
      {
        name: SERVICES.SHIPPING,
        transport: Transport.TCP,
        options: { host: '127.0.0.1', port: Number(process.env.SHIPPING_SERVICE_PORT ?? 3009) },
      },
    ]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, MidtransService],
})
export class PaymentsAppModule {}
