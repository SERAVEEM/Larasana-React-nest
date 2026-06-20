import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { GatewayClientsModule } from '../common/clients.module';
import { CheckoutGatewayController } from './checkout.controller';
import { requireSecret } from '../../../../libs/shared/src';

@Module({
  imports: [
    GatewayClientsModule,
    JwtModule.register({ secret: requireSecret('JWT_ACCESS_SECRET') }),
  ],
  controllers: [CheckoutGatewayController],
})
export class CheckoutGatewayModule {}
