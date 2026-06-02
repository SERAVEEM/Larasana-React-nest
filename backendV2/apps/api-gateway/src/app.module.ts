import { Module } from '@nestjs/common';
import { GatewayClientsModule } from './common/clients.module';
import { AuthGatewayModule }      from './auth/auth.module';
import { UsersGatewayModule }     from './users/users.module';
import { OrdersGatewayModule }    from './orders/orders.module';
import { FavoritesGatewayModule } from './favorites/favorites.module';
import { AddressesGatewayModule } from './addresses/addresses.module';
import { ShippingGatewayModule }  from './shipping/shipping.module';
import { CheckoutGatewayModule }  from './checkout/checkout.module';
import { AdminGatewayModule }     from './admin/admin.module';
import { ProductsGatewayModule }  from './products/products.module';

@Module({
  imports: [
    GatewayClientsModule,
    AuthGatewayModule,
    UsersGatewayModule,
    OrdersGatewayModule,
    FavoritesGatewayModule,
    AddressesGatewayModule,
    ShippingGatewayModule,
    CheckoutGatewayModule,
    AdminGatewayModule,
    ProductsGatewayModule,
  ],
})
export class GatewayAppModule {}
