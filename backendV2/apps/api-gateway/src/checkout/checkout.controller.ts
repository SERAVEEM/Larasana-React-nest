import { Controller, Post, Get, Body, Param, UseGuards, Inject, ParseIntPipe, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiOkResponse, ApiCreatedResponse, ApiUnauthorizedResponse, ApiBadRequestResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { SERVICES, PAYMENTS_PATTERNS } from '../../../../libs/shared/src';
import { JwtAuthGuard } from '../common/guards';
import { GetUser } from '../common/get-user.decorator';
import { CheckoutDto } from './dto/checkout.dto';
import { CheckoutResponseDto, PaymentStatusResponseDto } from './dto/checkout-response.dto';
import { BadRequestResponseDto, UnauthorizedResponseDto, NotFoundResponseDto } from '../common/dto/error-response.dto';

@ApiTags('checkout')
@Controller('checkout')
export class CheckoutGatewayController {
  constructor(@Inject(SERVICES.PAYMENTS) private client: ClientProxy) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Proses checkout — buat order + charge Midtrans' })
  @ApiCreatedResponse({ type: CheckoutResponseDto, description: 'Checkout berhasil dibuat' })
  @ApiBadRequestResponse({ type: BadRequestResponseDto, description: 'Gagal membuat checkout (input tidak valid)' })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponseDto })
  checkout(@GetUser() user: any, @Body() body: CheckoutDto) {
    return this.client.send(PAYMENTS_PATTERNS.CHECKOUT, { user: { id: user.sub, name: user.name, email: user.email }, ...body });
  }

  @Get('payment-status/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'orderId' })
  @ApiOperation({ summary: 'Cek status pembayaran (polling setiap 3 detik)' })
  @ApiOkResponse({ type: PaymentStatusResponseDto, description: 'Status pembayaran berhasil diambil' })
  @ApiNotFoundResponse({ type: NotFoundResponseDto, description: 'Order tidak ditemukan' })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponseDto })
  getStatus(
    @GetUser() user: any,
    @Param('orderId', ParseIntPipe) orderId: number,
    @Query('simulate') simulate?: string,
  ) {
    return this.client.send(PAYMENTS_PATTERNS.GET_STATUS, { userId: user.sub, orderId, simulate });
  }

  @Post('webhook/midtrans')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook Midtrans (otomatis dipanggil Midtrans)' })
  @ApiOkResponse({ schema: { type: 'object', properties: { received: { type: 'boolean', example: true } } }, description: 'Webhook diproses' })
  @ApiBadRequestResponse({ type: BadRequestResponseDto, description: 'Signature tidak valid' })
  webhook(@Body() payload: any) {
    return this.client.send(PAYMENTS_PATTERNS.WEBHOOK, payload);
  }
}
