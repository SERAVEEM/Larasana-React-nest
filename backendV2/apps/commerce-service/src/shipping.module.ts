import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShippingMethod, Address } from '../../../libs/shared/src';
import { ShippingController } from './shipping.controller';
import { ShippingService } from './shipping.service';
import { RajaOngkirProvider } from './shipping/providers/rajaongkir.provider';
import { EasyPostProvider } from './shipping/providers/easypost.provider';
import { BiteshipProvider } from './shipping/providers/biteship.provider';

@Module({
  imports: [TypeOrmModule.forFeature([ShippingMethod, Address])],
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
