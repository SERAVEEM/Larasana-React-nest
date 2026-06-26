import { Controller, Get, Param, Query, Inject, BadRequestException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiParam, ApiOkResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { retry } from 'rxjs/operators';
import { SERVICES, PRODUCTS_PATTERNS } from '../../../../libs/shared/src';
import { ProductsQueryDto } from './dto/products-query.dto';
import { Product } from '../../../../libs/shared/src/entities/product.entity';
import { NotFoundResponseDto } from '../common/dto/error-response.dto';

/**
 * Resolves a URL product ID segment to a numeric database ID.
 * Supports plain numeric strings as well as prefixed formats used by the
 * frontend for navigation (e.g. "grid-3", "p3").
 */
function resolveProductId(raw: string): number {
  // Strip known frontend prefixes before extracting the numeric part
  const cleaned = raw.replace(/^grid-/i, '').replace(/^p(?=[0-9])/i, '');
  const id = parseInt(cleaned, 10);
  if (isNaN(id) || id <= 0) {
    throw new BadRequestException(`Invalid product id: ${raw}`);
  }
  return id;
}

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
  findById(@Param('id') rawId: string) {
    const id = resolveProductId(rawId);
    return this.client.send(PRODUCTS_PATTERNS.FIND_BY_ID, { productId: id }).pipe(retry({ count: 2, delay: 300 }));
  }
}
