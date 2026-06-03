import { Controller, Get, Patch, Param, Query, Body, UseGuards, Inject, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiOkResponse, ApiUnauthorizedResponse, ApiNotFoundResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { SERVICES, ORDERS_PATTERNS } from '../../../../libs/shared/src';
import { JwtAuthGuard } from '../common/guards';
import { GetUser } from '../common/get-user.decorator';
import { OrdersQueryDto, CancelOrderDto } from './dto/orders.dto';
import { Order } from '../../../../libs/shared/src/entities/order.entity';
import { MessageResponseDto } from '../auth/dto/auth-response.dto';
import { BadRequestResponseDto, UnauthorizedResponseDto, NotFoundResponseDto } from '../common/dto/error-response.dto';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class OrdersGatewayController {
  constructor(@Inject(SERVICES.ORDERS) private client: ClientProxy) {}

  @Get('my')
  @ApiOperation({ summary: 'Riwayat order — filter status & search' })
  @ApiOkResponse({ type: [Order], description: 'Daftar riwayat order berhasil diambil' })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponseDto })
  getMyOrders(@GetUser() user: any, @Query() query: OrdersQueryDto) {
    return this.client.send(ORDERS_PATTERNS.GET_MY_ORDERS, { userId: user.sub, ...query });
  }

  @Get('my/:id')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Detail satu order' })
  @ApiOkResponse({ type: Order, description: 'Detail order ditemukan' })
  @ApiNotFoundResponse({ type: NotFoundResponseDto, description: 'Order tidak ditemukan' })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponseDto })
  getDetail(@GetUser() user: any, @Param('id', ParseIntPipe) orderId: number) {
    return this.client.send(ORDERS_PATTERNS.GET_DETAIL, { userId: user.sub, orderId });
  }

  @Patch('my/:id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Batalkan order (hanya pending)' })
  @ApiOkResponse({ type: MessageResponseDto, description: 'Order berhasil dibatalkan' })
  @ApiBadRequestResponse({ type: BadRequestResponseDto, description: 'Gagal membatalkan order (status bukan pending)' })
  @ApiNotFoundResponse({ type: NotFoundResponseDto })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponseDto })
  cancel(@GetUser() user: any, @Param('id', ParseIntPipe) orderId: number, @Body() body: CancelOrderDto) {
    return this.client.send(ORDERS_PATTERNS.CANCEL, { userId: user.sub, orderId, reason: body.reason });
  }
}
