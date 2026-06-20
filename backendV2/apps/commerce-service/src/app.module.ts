import { Module } from '@nestjs/common';
import {
  createDatabaseModule,
  User, RefreshToken, EmailVerification, PasswordReset, Order, OrderItem, Payment, Product, ProductImage, Favorite, Address, ShippingMethod,
} from '../../../libs/shared/src';
import { ProductsModule } from './products.module';
import { FavoritesModule } from './favorites.module';
import { AddressesModule } from './addresses.module';
import { ShippingModule } from './shipping.module';
import { OrdersModule } from './orders.module';
import { UploadModule } from './upload.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    createDatabaseModule([
      User, RefreshToken, EmailVerification, PasswordReset, Order, OrderItem, Payment, Product, ProductImage, Favorite, Address, ShippingMethod,
    ]),
    HealthModule,
    ProductsModule,
    FavoritesModule,
    AddressesModule,
    ShippingModule,
    OrdersModule,
    UploadModule,
  ],
})
export class CommerceAppModule {}
