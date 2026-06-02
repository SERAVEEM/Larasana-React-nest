import { Module } from '@nestjs/common';
import { GatewayClientsModule } from '../common/clients.module';
import { ProductsGatewayController } from './products.controller';

@Module({
  imports: [GatewayClientsModule],
  controllers: [ProductsGatewayController],
})
export class ProductsGatewayModule {}
