import { Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SERVICES, SHIPPING_PATTERNS } from '../../../../libs/shared/src';

@ApiTags('shipping')
@Controller('shipping')
export class ShippingGatewayController {
  constructor(@Inject(SERVICES.SHIPPING) private client: ClientProxy) {}

  @Get()
  @ApiOperation({ summary: 'Daftar kurir pengiriman' })
  getAll() {
    return this.client.send(SHIPPING_PATTERNS.GET_ALL, {});
  }
}
