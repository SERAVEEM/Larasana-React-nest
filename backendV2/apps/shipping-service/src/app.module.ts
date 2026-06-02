import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createDatabaseModule, ShippingMethod } from '../../../libs/shared/src';
import { ShippingController } from './shipping.controller';
import { ShippingService } from './shipping.service';

@Module({
  imports: [
    createDatabaseModule([ShippingMethod]),
    TypeOrmModule.forFeature([ShippingMethod]),
  ],
  controllers: [ShippingController],
  providers: [ShippingService],
})
export class ShippingAppModule {}
