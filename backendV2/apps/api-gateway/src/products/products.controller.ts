import { Controller, Get, Param, Query, Inject, ParseIntPipe } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { SERVICES, PRODUCTS_PATTERNS } from '../../../../libs/shared/src';

@ApiTags('products')
@Controller('products')
export class ProductsGatewayController {
  constructor(@Inject(SERVICES.PRODUCTS) private client: ClientProxy) {}

  @Get()
  @ApiOperation({ summary: 'List all active products' })
  findAll(@Query() query: any) {
    return this.client.send(PRODUCTS_PATTERNS.FIND_ALL, query);
  }

  @Get(':id')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Get product details' })
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.client.send(PRODUCTS_PATTERNS.FIND_BY_ID, { productId: id });
  }
}
