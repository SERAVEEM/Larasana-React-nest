import { Controller, Get, Patch, Param, Query, Body, UseGuards, Inject, ParseIntPipe, HttpCode, HttpStatus, Post, Put, Delete } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { SERVICES, ADMIN_PATTERNS, PRODUCTS_PATTERNS } from '../../../../libs/shared/src';
import { JwtAuthGuard } from '../common/guards';
import { AdminGuard } from '../common/admin.guards';
import { GetUser } from '../common/get-user.decorator';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth('access-token')
export class AdminGatewayController {
  constructor(
    @Inject(SERVICES.ADMIN) private client: ClientProxy,
    @Inject(SERVICES.PRODUCTS) private productsClient: ClientProxy,
  ) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Statistik dashboard admin' })
  dashboard() { return this.client.send(ADMIN_PATTERNS.DASHBOARD, {}); }

  @Get('users')
  @ApiOperation({ summary: 'List semua user' })
  getUsers(@Query() q: any) { return this.client.send(ADMIN_PATTERNS.GET_USERS, q); }

  @Get('users/:id')
  @ApiParam({ name: 'id' })
  getUserDetail(@Param('id', ParseIntPipe) id: number) { return this.client.send(ADMIN_PATTERNS.GET_USER_DETAIL, { userId: id }); }

  @Patch('users/:id/toggle-active')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Aktifkan / nonaktifkan user' })
  toggleUser(@Param('id', ParseIntPipe) id: number, @Body() body: any) { return this.client.send(ADMIN_PATTERNS.TOGGLE_USER, { userId: id, isActive: body.isActive }); }

  @Get('sellers')
  @ApiOperation({ summary: 'List seller' })
  getSellers(@Query() q: any) { return this.client.send(ADMIN_PATTERNS.GET_SELLERS, q); }

  @Patch('sellers/:userId/review')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'userId' })
  @ApiOperation({ summary: 'Approve / reject pengajuan seller' })
  reviewSeller(@Param('userId', ParseIntPipe) userId: number, @Body() body: any, @GetUser() user: any) {
    return this.client.send(ADMIN_PATTERNS.REVIEW_SELLER, { userId, ...body, adminId: user.sub });
  }

  @Get('orders')
  @ApiOperation({ summary: 'List semua order' })
  getOrders(@Query() q: any) { return this.client.send(ADMIN_PATTERNS.GET_ORDERS, q); }

  @Get('orders/:id')
  @ApiParam({ name: 'id' })
  getOrderDetail(@Param('id', ParseIntPipe) id: number) { return this.client.send(ADMIN_PATTERNS.GET_ORDER_DETAIL, { orderId: id }); }

  @Patch('orders/:id/status')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Update status order manual' })
  updateOrderStatus(@Param('id', ParseIntPipe) id: number, @Body() body: any, @GetUser() user: any) {
    return this.client.send(ADMIN_PATTERNS.UPDATE_ORDER_STATUS, { orderId: id, ...body, adminId: user.sub });
  }

  @Get('products')
  @ApiOperation({ summary: 'List semua produk' })
  getProducts(@Query() q: any) { return this.client.send(ADMIN_PATTERNS.GET_PRODUCTS, q); }

  @Patch('products/:id/toggle-active')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Aktifkan / nonaktifkan produk' })
  toggleProduct(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.client.send(ADMIN_PATTERNS.TOGGLE_PRODUCT, { productId: id, isActive: body.isActive });
  }
  @Post('products')
  @ApiOperation({ summary: 'Tambah produk baru' })
  createProduct(@Body() body: any) {
    return this.productsClient.send(PRODUCTS_PATTERNS.CREATE, body);
  }

  @Put('products/:id')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Edit produk' })
  updateProduct(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.productsClient.send(PRODUCTS_PATTERNS.UPDATE, { productId: id, productData: body });
  }

  @Delete('products/:id')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Hapus produk' })
  deleteProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productsClient.send(PRODUCTS_PATTERNS.DELETE, { productId: id });
  }
}
