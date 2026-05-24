import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createDatabaseModule, Address } from '../../../libs/shared/src';
import { AddressesController } from './addresses.controller';
import { AddressesService } from './addresses.service';

@Module({
  imports: [
    createDatabaseModule([Address]),
    TypeOrmModule.forFeature([Address]),
  ],
  controllers: [AddressesController],
  providers: [AddressesService],
})
export class AddressesAppModule {}
