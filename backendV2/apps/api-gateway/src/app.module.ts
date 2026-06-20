import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { GatewayClientsModule } from './common/clients.module';
import { HealthModule } from './health/health.module';
import { AuthGatewayModule }      from './auth/auth.module';
import { UsersGatewayModule }     from './users/users.module';
import { OrdersGatewayModule }    from './orders/orders.module';
import { FavoritesGatewayModule } from './favorites/favorites.module';
import { AddressesGatewayModule } from './addresses/addresses.module';
import { ShippingGatewayModule }  from './shipping/shipping.module';
import { CheckoutGatewayModule }  from './checkout/checkout.module';
import { AdminGatewayModule }     from './admin/admin.module';
import { ProductsGatewayModule }  from './products/products.module';
import { UploadGatewayModule }    from './upload/upload.module';

@Module({
  imports: [
    // 20 requests per minute default — tightened per route in auth.controller.ts
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 20 }]),
    GatewayClientsModule,
    HealthModule,
    AuthGatewayModule,
    UsersGatewayModule,
    OrdersGatewayModule,
    FavoritesGatewayModule,
    AddressesGatewayModule,
    ShippingGatewayModule,
    CheckoutGatewayModule,
    AdminGatewayModule,
    ProductsGatewayModule,
    UploadGatewayModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class GatewayAppModule {}

