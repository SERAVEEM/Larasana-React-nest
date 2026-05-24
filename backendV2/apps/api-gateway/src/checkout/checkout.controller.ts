import { Controller, Post, Get, Body, Param, UseGuards, Inject, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { SERVICES, PAYMENTS_PATTERNS } from '../../../../libs/shared/src';
import { JwtAuthGuard } from '../common/guards';
import { GetUser } from '../common/get-user.decorator';

@ApiTags('checkout')
@Controller('checkout')
export class CheckoutGatewayController {
  constructor(@Inject(SERVICES.PAYMENTS) private client: ClientProxy) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Proses checkout — buat order + charge Midtrans' })
  checkout(@GetUser() user: any, @Body() body: any) {
    return this.client.send(PAYMENTS_PATTERNS.CHECKOUT, { user: { id: user.sub, name: user.name, email: user.email }, ...body });
  }

  @Get('payment-status/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'orderId' })
  @ApiOperation({ summary: 'Cek status pembayaran (polling setiap 3 detik)' })
  getStatus(@GetUser() user: any, @Param('orderId', ParseIntPipe) orderId: number) {
    return this.client.send(PAYMENTS_PATTERNS.GET_STATUS, { userId: user.sub, orderId });
  }

  @Post('webhook/midtrans')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook Midtrans (otomatis dipanggil Midtrans)' })
  webhook(@Body() payload: any) {
    return this.client.send(PAYMENTS_PATTERNS.WEBHOOK, payload);
  }
}
