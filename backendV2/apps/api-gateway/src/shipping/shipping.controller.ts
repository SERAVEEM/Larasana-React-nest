import { Controller, Get, Inject, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { SERVICES, SHIPPING_PATTERNS } from '../../../../libs/shared/src';
import { ShippingMethod } from '../../../../libs/shared/src/entities/shipping-method.entity';

@ApiTags('shipping')
@Controller('shipping')
export class ShippingGatewayController {
  constructor(@Inject(SERVICES.SHIPPING) private client: ClientProxy) {}

  @Get()
  @ApiOperation({ summary: 'Daftar kurir pengiriman' })
  @ApiOkResponse({ type: [ShippingMethod], description: 'Daftar kurir pengiriman aktif berhasil diambil' })
  getAll(@Query('addressId') addressId?: string) {
    return this.client.send(SHIPPING_PATTERNS.GET_ALL, { addressId: addressId ? Number(addressId) : undefined });
  }
}
