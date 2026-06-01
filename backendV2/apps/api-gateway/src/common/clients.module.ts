import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SERVICES } from '../../../../libs/shared/src';

const tcpClient = (name: string, portEnv: string, defaultPort: number) => ({
  name,
  transport: Transport.TCP as any,
  options: { host: '127.0.0.1', port: Number(process.env[portEnv] ?? defaultPort) },
});

@Module({
  imports: [
    ClientsModule.register([
      tcpClient(SERVICES.AUTH,         'AUTH_SERVICE_PORT',         3001),
      tcpClient(SERVICES.USERS,        'USERS_SERVICE_PORT',        3002),
      tcpClient(SERVICES.ORDERS,       'ORDERS_SERVICE_PORT',       3003),
      tcpClient(SERVICES.PRODUCTS,     'PRODUCTS_SERVICE_PORT',     3004),
      tcpClient(SERVICES.PAYMENTS,     'PAYMENTS_SERVICE_PORT',     3005),
      tcpClient(SERVICES.ADMIN,        'ADMIN_SERVICE_PORT',        3006),
      tcpClient(SERVICES.NOTIFICATION, 'NOTIFICATION_SERVICE_PORT', 3007),
      tcpClient(SERVICES.FAVORITES,    'FAVORITES_SERVICE_PORT',    3008),
      tcpClient(SERVICES.ADDRESSES,    'ADDRESSES_SERVICE_PORT',    3009),
      tcpClient(SERVICES.SHIPPING,     'SHIPPING_SERVICE_PORT',     3010),
    ]),
  ],
  exports: [ClientsModule],
})
export class GatewayClientsModule {}
