import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { GatewayClientsModule } from '../common/clients.module';
import { FavoritesGatewayController } from './favorites.controller';

@Module({
  imports: [
    GatewayClientsModule,
    JwtModule.register({ secret: process.env.JWT_ACCESS_SECRET ?? 'secret' }),
  ],
  controllers: [FavoritesGatewayController],
})
export class FavoritesGatewayModule {}
