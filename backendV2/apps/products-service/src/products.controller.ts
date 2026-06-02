import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProductsService } from './products.service';
import { PRODUCTS_PATTERNS } from '../../../libs/shared/src';

@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @MessagePattern(PRODUCTS_PATTERNS.FIND_ALL)
  findAll(@Payload() data: { search?: string; page?: number; limit?: number }) {
    return this.productsService.findAll(data);
  }

  @MessagePattern(PRODUCTS_PATTERNS.FIND_BY_ID)
  findById(@Payload() data: { productId: number }) {
    return this.productsService.findById(data.productId);
  }
  @MessagePattern(PRODUCTS_PATTERNS.CREATE)
  create(@Payload() data: any) {
    return this.productsService.create(data);
  }

  @MessagePattern(PRODUCTS_PATTERNS.UPDATE)
  update(@Payload() data: { productId: number; productData: any }) {
    return this.productsService.update(data.productId, data.productData);
  }

  @MessagePattern(PRODUCTS_PATTERNS.DELETE)
  delete(@Payload() data: { productId: number }) {
    return this.productsService.delete(data.productId);
  }
}
