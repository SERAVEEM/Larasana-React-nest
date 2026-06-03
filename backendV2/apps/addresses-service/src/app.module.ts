import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createDatabaseModule, Address, User } from '../../../libs/shared/src';
import { AddressesController } from './addresses.controller';
import { AddressesService } from './addresses.service';

@Module({
  imports: [
    createDatabaseModule([Address, User]),
    TypeOrmModule.forFeature([Address, User]),
  ],
  controllers: [AddressesController],
  providers: [AddressesService],
})
export class AddressesAppModule {}
