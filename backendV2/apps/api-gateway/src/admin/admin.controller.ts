import { Controller, Get, Patch, Param, Query, Body, UseGuards, Inject, ParseIntPipe, HttpCode, HttpStatus, Post, Put, Delete } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiOkResponse, ApiCreatedResponse, ApiUnauthorizedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { SERVICES, ADMIN_PATTERNS, PRODUCTS_PATTERNS } from '../../../../libs/shared/src';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../common/guards';
import { AdminGuard } from '../common/admin.guards';
import { GetUser } from '../common/get-user.decorator';

import {
  DashboardStatsResponseDto, PaginatedUsersResponseDto, ToggleUserResponseDto,
  ReviewSellerResponseDto, PaginatedOrdersResponseDto, AdminOrderDetailResponseDto,
  UpdateOrderStatusResponseDto, PaginatedProductsResponseDto, ToggleProductResponseDto
} from './dto/admin-response.dto';
import { User } from '../../../../libs/shared/src/entities/user.entity';
import { Product } from '../../../../libs/shared/src/entities/product.entity';
import { MessageResponseDto } from '../auth/dto/auth-response.dto';
import { BadRequestResponseDto, UnauthorizedResponseDto, ForbiddenResponseDto, NotFoundResponseDto } from '../common/dto/error-response.dto';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ type: UnauthorizedResponseDto, description: 'Authentication token is invalid or missing' })
@ApiForbiddenResponse({ type: ForbiddenResponseDto, description: 'Only admin is allowed to access this resource' })
export class AdminGatewayController {
  constructor(
    @Inject(SERVICES.ADMIN) private client: ClientProxy,
    @Inject(SERVICES.PRODUCTS) private productsClient: ClientProxy,
  ) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Statistik dashboard admin' })
  @ApiOkResponse({ type: DashboardStatsResponseDto, description: 'Berhasil mengambil statistik dashboard' })
  dashboard() { return this.client.send(ADMIN_PATTERNS.DASHBOARD, {}); }

  @Get('users')
  @ApiOperation({ summary: 'List semua user' })
  @ApiOkResponse({ type: PaginatedUsersResponseDto, description: 'Daftar user berhalaman' })
  getUsers(@Query() q: any) { return this.client.send(ADMIN_PATTERNS.GET_USERS, q); }

  @Get('users/:id')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Detail satu user' })
  @ApiOkResponse({ type: User, description: 'Detail user ditemukan' })
  @ApiNotFoundResponse({ type: NotFoundResponseDto })
  getUserDetail(@Param('id', ParseIntPipe) id: number) { return this.client.send(ADMIN_PATTERNS.GET_USER_DETAIL, { userId: id }); }

  @Patch('users/:id/toggle-active')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Aktifkan / nonaktifkan user' })
  @ApiOkResponse({ type: ToggleUserResponseDto, description: 'Status aktif user berhasil diubah' })
  @ApiNotFoundResponse({ type: NotFoundResponseDto })
  @ApiBadRequestResponse({ type: BadRequestResponseDto })
  toggleUser(@Param('id', ParseIntPipe) id: number, @Body() body: any) { return this.client.send(ADMIN_PATTERNS.TOGGLE_USER, { userId: id, isActive: body.isActive }); }

  @Get('sellers')
  @ApiOperation({ summary: 'List seller' })
  @ApiOkResponse({ type: PaginatedUsersResponseDto, description: 'Daftar seller berhalaman' })
  getSellers(@Query() q: any) { return this.client.send(ADMIN_PATTERNS.GET_SELLERS, q); }

  @Patch('sellers/:userId/review')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'userId' })
  @ApiOperation({ summary: 'Approve / reject pengajuan seller' })
  @ApiOkResponse({ type: ReviewSellerResponseDto, description: 'Berhasil me-review pengajuan seller' })
  @ApiNotFoundResponse({ type: NotFoundResponseDto })
  @ApiBadRequestResponse({ type: BadRequestResponseDto })
  reviewSeller(@Param('userId', ParseIntPipe) userId: number, @Body() body: any, @GetUser() user: any) {
    return this.client.send(ADMIN_PATTERNS.REVIEW_SELLER, { userId, ...body, adminId: user.sub });
  }

  @Get('orders')
  @ApiOperation({ summary: 'List semua order' })
  @ApiOkResponse({ type: PaginatedOrdersResponseDto, description: 'Daftar order berhalaman' })
  getOrders(@Query() q: any) { return this.client.send(ADMIN_PATTERNS.GET_ORDERS, q); }

  @Get('orders/:id')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Detail satu order untuk admin' })
  @ApiOkResponse({ type: AdminOrderDetailResponseDto, description: 'Order & payment details' })
  @ApiNotFoundResponse({ type: NotFoundResponseDto })
  getOrderDetail(@Param('id', ParseIntPipe) id: number) { return this.client.send(ADMIN_PATTERNS.GET_ORDER_DETAIL, { orderId: id }); }

  @Patch('orders/:id/status')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Update status order manual' })
  @ApiOkResponse({ type: UpdateOrderStatusResponseDto, description: 'Status order berhasil diperbarui' })
  @ApiNotFoundResponse({ type: NotFoundResponseDto })
  updateOrderStatus(@Param('id', ParseIntPipe) id: number, @Body() body: any, @GetUser() user: any) {
    return this.client.send(ADMIN_PATTERNS.UPDATE_ORDER_STATUS, { orderId: id, ...body, adminId: user.sub });
  }

  @Get('products')
  @ApiOperation({ summary: 'List semua produk' })
  @ApiOkResponse({ type: PaginatedProductsResponseDto, description: 'Daftar produk berhalaman' })
  getProducts(@Query() q: any) { return this.client.send(ADMIN_PATTERNS.GET_PRODUCTS, q); }

  @Patch('products/:id/toggle-active')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Aktifkan / nonaktifkan produk' })
  @ApiOkResponse({ type: ToggleProductResponseDto, description: 'Status aktif produk berhasil diubah' })
  @ApiNotFoundResponse({ type: NotFoundResponseDto })
  toggleProduct(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.client.send(ADMIN_PATTERNS.TOGGLE_PRODUCT, { productId: id, isActive: body.isActive });
  }

  @Post('products')
  @ApiOperation({ summary: 'Tambah produk baru' })
  @ApiCreatedResponse({ type: Product, description: 'Produk berhasil ditambahkan' })
  @ApiBadRequestResponse({ type: BadRequestResponseDto })
  createProduct(@Body() body: CreateProductDto) {
    return this.productsClient.send(PRODUCTS_PATTERNS.CREATE, body);
  }

  @Put('products/:id')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Edit produk' })
  @ApiOkResponse({ type: Product, description: 'Produk berhasil diperbarui' })
  @ApiNotFoundResponse({ type: NotFoundResponseDto })
  @ApiBadRequestResponse({ type: BadRequestResponseDto })
  updateProduct(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateProductDto) {
    return this.productsClient.send(PRODUCTS_PATTERNS.UPDATE, { productId: id, productData: body });
  }

  @Delete('products/:id')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Hapus produk' })
  @ApiOkResponse({ type: MessageResponseDto, description: 'Produk berhasil dihapus' })
  @ApiNotFoundResponse({ type: NotFoundResponseDto })
  deleteProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productsClient.send(PRODUCTS_PATTERNS.DELETE, { productId: id });
  }
}
