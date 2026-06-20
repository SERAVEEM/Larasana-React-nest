import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { GatewayClientsModule } from '../common/clients.module';
import { FavoritesGatewayController } from './favorites.controller';
import { requireSecret } from '../../../../libs/shared/src';

@Module({
  imports: [
    GatewayClientsModule,
    JwtModule.register({ secret: requireSecret('JWT_ACCESS_SECRET') }),
  ],
  controllers: [FavoritesGatewayController],
})
export class FavoritesGatewayModule {}
