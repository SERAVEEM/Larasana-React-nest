import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { ShippingMethod, Address } from '../../../libs/shared/src';
import { ShippingController } from './shipping.controller';
import { ShippingService } from './shipping.service';
import { RajaOngkirProvider } from './shipping/providers/rajaongkir.provider';
import { EasyPostProvider } from './shipping/providers/easypost.provider';
import { BiteshipProvider } from './shipping/providers/biteship.provider';

@Module({
  imports: [
    TypeOrmModule.forFeature([ShippingMethod, Address]),
    CacheModule.registerAsync({
      useFactory: async () => {
        const redisHost = process.env.REDIS_HOST;
        const redisPort = Number(process.env.REDIS_PORT || '6379');

        if (redisHost && redisHost.trim() !== '') {
          const store = await redisStore({
            socket: {
              host: redisHost,
              port: redisPort,
            },
          });
          return { store };
        }
        // Fallback to in-memory store
        return {};
      },
    }),
  ],
  controllers: [ShippingController],
  providers: [
    ShippingService,
    RajaOngkirProvider,
    EasyPostProvider,
    BiteshipProvider,
  ],
  exports: [ShippingService],
})
export class ShippingModule {}

