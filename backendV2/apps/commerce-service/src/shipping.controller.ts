import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ShippingService } from './shipping.service';
import { SHIPPING_PATTERNS } from '../../../libs/shared/src';

@Controller()
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @MessagePattern(SHIPPING_PATTERNS.GET_ALL)
  getAll(@Payload() data?: { addressId?: number }) {
    return this.shippingService.getAll(data);
  }

  @MessagePattern(SHIPPING_PATTERNS.FIND_BY_ID)
  findById(@Payload() data: { id: number }) {
    return this.shippingService.findById(data.id);
  }
}
