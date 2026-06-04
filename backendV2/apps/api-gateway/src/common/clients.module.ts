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
      tcpClient(SERVICES.AUTH,         'USERS_SERVICE_PORT',        3001),
      tcpClient(SERVICES.USERS,        'USERS_SERVICE_PORT',        3001),
      tcpClient(SERVICES.ADMIN,        'USERS_SERVICE_PORT',        3001),
      
      tcpClient(SERVICES.PRODUCTS,     'COMMERCE_SERVICE_PORT',     3002),
      tcpClient(SERVICES.FAVORITES,    'COMMERCE_SERVICE_PORT',     3002),
      tcpClient(SERVICES.ADDRESSES,    'COMMERCE_SERVICE_PORT',     3002),
      tcpClient(SERVICES.SHIPPING,     'COMMERCE_SERVICE_PORT',     3002),
      tcpClient(SERVICES.ORDERS,       'COMMERCE_SERVICE_PORT',     3002),
      tcpClient(SERVICES.PAYMENTS,     'COMMERCE_SERVICE_PORT',     3002),
      
      tcpClient(SERVICES.NOTIFICATION, 'NOTIFICATION_SERVICE_PORT', 3003),
    ]),
  ],
  exports: [ClientsModule],
})
export class GatewayClientsModule {}
