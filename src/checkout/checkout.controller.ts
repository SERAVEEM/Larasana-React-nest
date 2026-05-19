import {
  Controller, Post, Get, Body, Param,
  UseGuards, ParseIntPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CheckoutService } from './checkout.service';
import { CheckoutDto } from './dto/checkout.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('checkout')
@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  // POST /api/v1/checkout
  // Main checkout: buat order + charge Midtrans sekaligus
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Proses checkout',
    description:
      'Buat order + bayar sekaligus. ' +
      'Response berisi paymentUrl (Snap), qrImageUrl (QRIS), atau vaNumber (VA).',
  })
  checkout(@GetUser() user: User, @Body() dto: CheckoutDto) {
    return this.checkoutService.checkout(user, dto);
  }

  // GET /api/v1/checkout/payment-status/:orderId
  // Polling status bayar dari frontend
  @Get('payment-status/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Cek status pembayaran',
    description: 'Dipakai polling setiap 3 detik dari halaman "Menunggu Pembayaran"',
  })
  @ApiParam({ name: 'orderId' })
  getPaymentStatus(
    @GetUser('id') userId: number,
    @Param('orderId', ParseIntPipe) orderId: number,
  ) {
    return this.checkoutService.getPaymentStatus(userId, orderId);
  }

  // POST /api/v1/checkout/webhook/midtrans
  // Midtrans kirim notifikasi ke endpoint ini saat status berubah
  // PENTING: endpoint ini PUBLIC (tidak pakai JWT) karena Midtrans yang akses
  @Post('webhook/midtrans')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Webhook Midtrans (jangan diakses manual)',
    description: 'Endpoint ini dipanggil otomatis oleh Midtrans saat status payment berubah. Daftarkan URL ini di dashboard Midtrans > Settings > Payment Notification.',
  })
  handleWebhook(@Body() payload: any) {
    return this.checkoutService.handleWebhook(payload);
  }
}
