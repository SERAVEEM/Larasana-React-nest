import {
  Controller, Get, Patch, Param, Query, Body,
  UseGuards, ParseIntPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { OrderQueryDto } from './dto/order-query.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // GET /api/v1/orders/my
  // Halaman Order History — support filter status & search
  @Get('my')
  @ApiOperation({
    summary: 'Ambil riwayat order user login',
    description:
      'Return list order dengan pagination. ' +
      'Filter: ?status=pending|processing|shipped|delivered|cancelled. ' +
      'Search: ?search=LRS-2024 atau nama produk',
  })
  getMyOrders(
    @GetUser('id') userId: number,
    @Query() query: OrderQueryDto,
  ) {
    return this.ordersService.getMyOrders(userId, query);
  }

  // GET /api/v1/orders/my/:id
  // Detail satu order
  @Get('my/:id')
  @ApiOperation({ summary: 'Detail order tertentu milik user login' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  getOrderDetail(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) orderId: number,
  ) {
    return this.ordersService.getOrderDetail(userId, orderId);
  }

  // PATCH /api/v1/orders/my/:id/cancel
  // Cancel order — hanya status 'pending' yang bisa dibatalkan
  @Patch('my/:id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Batalkan order',
    description: 'Hanya bisa dilakukan jika status masih "pending"',
  })
  @ApiParam({ name: 'id', description: 'Order ID' })
  cancelOrder(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) orderId: number,
    @Body() dto: CancelOrderDto,
  ) {
    return this.ordersService.cancelOrder(userId, orderId, dto);
  }
}
