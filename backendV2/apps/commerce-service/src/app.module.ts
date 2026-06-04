import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  createDatabaseModule,
  User, RefreshToken, EmailVerification, PasswordReset, Order, OrderItem, Payment, Product, ProductImage, Favorite, Address, ShippingMethod,
} from '../../../libs/shared/src';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';
import { AddressesController } from './addresses.controller';
import { AddressesService } from './addresses.service';
import { ShippingController } from './shipping.controller';
import { ShippingService } from './shipping.service';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { MidtransService } from './midtrans.service';

@Module({
  imports: [
    createDatabaseModule([
      User, RefreshToken, EmailVerification, PasswordReset, Order, OrderItem, Payment, Product, ProductImage, Favorite, Address, ShippingMethod,
    ]),
    TypeOrmModule.forFeature([
      Order, OrderItem, Payment, Product, ProductImage, Favorite, Address, ShippingMethod, User,
    ]),
  ],
  controllers: [
    ProductsController,
    FavoritesController,
    AddressesController,
    ShippingController,
    OrdersController,
    PaymentsController,
  ],
  providers: [
    ProductsService,
    FavoritesService,
    AddressesService,
    ShippingService,
    OrdersService,
    PaymentsService,
    MidtransService,
  ],
})
export class CommerceAppModule {}
