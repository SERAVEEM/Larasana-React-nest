import { Controller, Get, Param, Query, Inject, ParseIntPipe } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiParam, ApiOkResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { retry } from 'rxjs/operators';
import { SERVICES, PRODUCTS_PATTERNS } from '../../../../libs/shared/src';
import { ProductsQueryDto } from './dto/products-query.dto';
import { Product } from '../../../../libs/shared/src/entities/product.entity';
import { NotFoundResponseDto } from '../common/dto/error-response.dto';

@ApiTags('products')
@Controller('products')
export class ProductsGatewayController {
  constructor(@Inject(SERVICES.PRODUCTS) private client: ClientProxy) {}

  @Get()
  @ApiOperation({ summary: 'List all active products' })
  @ApiOkResponse({ type: [Product], description: 'Daftar produk aktif berhasil diambil' })
  findAll(@Query() query: ProductsQueryDto) {
    return this.client.send(PRODUCTS_PATTERNS.FIND_ALL, query).pipe(retry({ count: 2, delay: 300 }));
  }

  @Get(':id')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Get product details' })
  @ApiOkResponse({ type: Product, description: 'Detail produk ditemukan' })
  @ApiNotFoundResponse({ type: NotFoundResponseDto, description: 'Produk tidak ditemukan' })
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.client.send(PRODUCTS_PATTERNS.FIND_BY_ID, { productId: id }).pipe(retry({ count: 2, delay: 300 }));
  }
}
