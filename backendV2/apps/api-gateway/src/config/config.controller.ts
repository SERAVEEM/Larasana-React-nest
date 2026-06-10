import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';

@ApiTags('config')
@Controller('config')
export class ConfigController {
  /**
   * Returns the current server-side USD→IDR exchange rate.
   * Clients MUST fetch this on checkout page mount and apply a 10-minute TTL.
   * The backend never trusts the rate provided by the client.
   */
  @Get('rates')
  @ApiOperation({
    summary: 'Ambil kurs USD/IDR saat ini dari server',
    description:
      'Kembalikan nilai kurs USD ke IDR yang digunakan server untuk konversi harga. ' +
      'Frontend harus mem-fetch ini saat halaman checkout dimuat dan menerapkan TTL 10 menit.',
  })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        usdRate: { type: 'number', example: 15000 },
        currency: { type: 'string', example: 'IDR' },
        fetchedAt: { type: 'string', format: 'date-time' },
        ttlSeconds: { type: 'number', example: 600 },
      },
    },
  })
  getRates() {
    return {
      usdRate: Number(process.env.RAJAONGKIR_USD_RATE ?? 15000),
      currency: 'IDR',
      fetchedAt: new Date().toISOString(),
      ttlSeconds: 600, // 10 minutes — clients should re-fetch after this
      midtransClientKey: process.env.MIDTRANS_CLIENT_KEY ?? 'Mid-client-c5ohw8WHhSuc-ygW',
    };
  }
}
