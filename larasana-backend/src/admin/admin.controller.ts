import {
  Controller, Get, Patch, Param, Query, Body,
  UseGuards, ParseIntPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminGuard } from './guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import {
  AdminUserQueryDto,
  AdminSellerQueryDto,
  AdminOrderQueryDto,
  AdminUpdateOrderStatusDto,
  ReviewSellerDto,
  AdminToggleUserDto,
} from './dto/admin.dto';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)   // semua endpoint wajib login + role admin
@ApiBearerAuth('access-token')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ── DASHBOARD ──────────────────────────────────────────────

  @Get('dashboard')
  @ApiOperation({
    summary: 'Statistik dashboard admin',
    description: 'Total user, order, produk, dan revenue platform',
  })
  getDashboard() {
    return this.adminService.getDashboardStats();
  }

  // ── USER MANAGEMENT ────────────────────────────────────────

  @Get('users')
  @ApiOperation({ summary: 'List semua user — bisa filter role & search nama/email' })
  getAllUsers(@Query() query: AdminUserQueryDto) {
    return this.adminService.getAllUsers(query);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Detail satu user' })
  @ApiParam({ name: 'id' })
  getUserDetail(@Param('id', ParseIntPipe) userId: number) {
    return this.adminService.getUserDetail(userId);
  }

  @Patch('users/:id/toggle-active')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Aktifkan / nonaktifkan akun user' })
  @ApiParam({ name: 'id' })
  toggleUserActive(
    @Param('id', ParseIntPipe) userId: number,
    @Body() dto: AdminToggleUserDto,
  ) {
    return this.adminService.toggleUserActive(userId, dto.isActive);
  }

  // ── SELLER APPLICATIONS ────────────────────────────────────

  @Get('sellers')
  @ApiOperation({
    summary: 'List seller & pengajuan seller',
    description: 'Tampilkan semua seller yang sudah approved',
  })
  getSellerApplications(@Query() query: AdminSellerQueryDto) {
    return this.adminService.getSellerApplications(query);
  }

  @Patch('sellers/:userId/review')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Approve atau reject pengajuan seller',
    description: 'decision: "approved" → user jadi seller. "rejected" → wajib isi reason.',
  })
  @ApiParam({ name: 'userId' })
  reviewSeller(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: ReviewSellerDto,
    @GetUser('id') adminId: number,
  ) {
    return this.adminService.reviewSeller(userId, dto, adminId);
  }

  // ── ORDER MANAGEMENT ───────────────────────────────────────

  @Get('orders')
  @ApiOperation({ summary: 'List semua order platform — bisa filter status & search kode order' })
  getAllOrders(@Query() query: AdminOrderQueryDto) {
    return this.adminService.getAllOrders(query);
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Detail order + data payment-nya' })
  @ApiParam({ name: 'id' })
  getOrderDetail(@Param('id', ParseIntPipe) orderId: number) {
    return this.adminService.getOrderDetail(orderId);
  }

  @Patch('orders/:id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update status order secara manual',
    description: 'Dipakai admin untuk tandai shipped setelah input resi, atau force complete order',
  })
  @ApiParam({ name: 'id' })
  updateOrderStatus(
    @Param('id', ParseIntPipe) orderId: number,
    @Body() dto: AdminUpdateOrderStatusDto,
    @GetUser('id') adminId: number,
  ) {
    return this.adminService.updateOrderStatus(orderId, dto, adminId);
  }

  // ── PRODUCT MODERATION ─────────────────────────────────────

  @Get('products')
  @ApiOperation({ summary: 'List semua produk platform — bisa search nama' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getAllProducts(
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.getAllProducts(search, page, limit);
  }

  @Patch('products/:id/toggle-active')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Aktifkan / nonaktifkan produk (moderasi)' })
  @ApiParam({ name: 'id' })
  toggleProductActive(
    @Param('id', ParseIntPipe) productId: number,
    @Body() body: { isActive: boolean },
  ) {
    return this.adminService.toggleProductActive(productId, body.isActive);
  }
}
