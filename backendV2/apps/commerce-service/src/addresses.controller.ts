import { Controller, UseFilters } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AddressesService } from './addresses.service';
import { ADDRESSES_PATTERNS, AllExceptionsToRpcFilter } from '../../../libs/shared/src';

@UseFilters(AllExceptionsToRpcFilter)
@Controller()
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @MessagePattern(ADDRESSES_PATTERNS.GET_MY)
  getAll(@Payload() data: { userId: number }) {
    return this.addressesService.getMyAddresses(data.userId);
  }

  @MessagePattern(ADDRESSES_PATTERNS.CREATE)
  create(@Payload() data: { userId: number; [key: string]: any }) {
    const { userId, ...dto } = data;
    return this.addressesService.createAddress(userId, dto as any);
  }

  @MessagePattern(ADDRESSES_PATTERNS.UPDATE)
  update(@Payload() data: { userId: number; addressId: number; [key: string]: any }) {
    const { userId, addressId, ...dto } = data;
    return this.addressesService.updateAddress(userId, addressId, dto as any);
  }

  @MessagePattern(ADDRESSES_PATTERNS.SET_PRIMARY)
  setPrimary(@Payload() data: { userId: number; addressId: number }) {
    return this.addressesService.setPrimary(data.userId, data.addressId);
  }

  @MessagePattern(ADDRESSES_PATTERNS.DELETE)
  delete(@Payload() data: { userId: number; addressId: number }) {
    return this.addressesService.deleteAddress(data.userId, data.addressId);
  }

  @MessagePattern(ADDRESSES_PATTERNS.FIND_ONE)
  findOne(@Payload() data: { userId: number; addressId: number }) {
    return this.addressesService.findOneOrFail(data.userId, data.addressId);
  }
}
