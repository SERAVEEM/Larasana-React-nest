// src/shipping/shipping.controller.ts
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ShippingService } from './shipping.service';

@ApiTags('shipping')
@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  // GET /api/v1/shipping
  // Public — dipakai halaman checkout untuk tampilkan pilihan kurir
  @Get()
  @ApiOperation({ summary: 'Ambil semua opsi pengiriman yang tersedia' })
  getAll() {
    return this.shippingService.getAll();
  }
}
