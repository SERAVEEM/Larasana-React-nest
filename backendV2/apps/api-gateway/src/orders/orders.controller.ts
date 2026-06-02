import { Controller, Get, Patch, Param, Query, Body, UseGuards, Inject, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { SERVICES, ORDERS_PATTERNS } from '../../../../libs/shared/src';
import { JwtAuthGuard } from '../common/guards';
import { GetUser } from '../common/get-user.decorator';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class OrdersGatewayController {
  constructor(@Inject(SERVICES.ORDERS) private client: ClientProxy) {}

  @Get('my')
  @ApiOperation({ summary: 'Riwayat order — filter status & search' })
  getMyOrders(@GetUser() user: any, @Query() query: any) {
    return this.client.send(ORDERS_PATTERNS.GET_MY_ORDERS, { userId: user.sub, ...query });
  }

  @Get('my/:id')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Detail satu order' })
  getDetail(@GetUser() user: any, @Param('id', ParseIntPipe) orderId: number) {
    return this.client.send(ORDERS_PATTERNS.GET_DETAIL, { userId: user.sub, orderId });
  }

  @Patch('my/:id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Batalkan order (hanya pending)' })
  cancel(@GetUser() user: any, @Param('id', ParseIntPipe) orderId: number, @Body() body: any) {
    return this.client.send(ORDERS_PATTERNS.CANCEL, { userId: user.sub, orderId, reason: body.reason });
  }
}
