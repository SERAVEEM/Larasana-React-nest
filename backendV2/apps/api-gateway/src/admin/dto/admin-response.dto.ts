import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../../../../libs/shared/src/entities/user.entity';
import { Order } from '../../../../../libs/shared/src/entities/order.entity';
import { Product } from '../../../../../libs/shared/src/entities/product.entity';
import { Payment } from '../../../../../libs/shared/src/entities/payment.entity';

export class DashboardUsersStatsDto {
  @ApiProperty({ example: 120 })
  total: number;

  @ApiProperty({ example: 100 })
  buyers: number;

  @ApiProperty({ example: 20 })
  sellers: number;
}

export class DashboardOrdersStatsDto {
  @ApiProperty({ example: 45 })
  total: number;

  @ApiProperty({ example: 12 })
  pending: number;
}

export class DashboardProductsStatsDto {
  @ApiProperty({ example: 35 })
  total: number;
}

export class DashboardRevenueStatsDto {
  @ApiProperty({ example: 12500.50 })
  total: number;
}

export class DashboardStatsResponseDto {
  @ApiProperty({ type: DashboardUsersStatsDto })
  users: DashboardUsersStatsDto;

  @ApiProperty({ type: DashboardOrdersStatsDto })
  orders: DashboardOrdersStatsDto;

  @ApiProperty({ type: DashboardProductsStatsDto })
  products: DashboardProductsStatsDto;

  @ApiProperty({ type: DashboardRevenueStatsDto })
  revenue: DashboardRevenueStatsDto;
}

export class PaginatedUsersResponseDto {
  @ApiProperty({ type: [User] })
  data: User[];

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 5 })
  totalPages: number;
}

export class PaginatedOrdersResponseDto {
  @ApiProperty({ type: [Order] })
  data: Order[];

  @ApiProperty({ example: 50 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 3 })
  totalPages: number;
}

export class PaginatedProductsResponseDto {
  @ApiProperty({ type: [Product] })
  data: Product[];

  @ApiProperty({ example: 30 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 2 })
  totalPages: number;
}

export class AdminOrderDetailResponseDto {
  @ApiProperty({ type: () => Order })
  order: Order;

  @ApiProperty({ type: () => Payment })
  payment: Payment;
}

export class ToggleUserResponseDto {
  @ApiProperty({ example: 'Akun John Doe berhasil dinonaktifkan' })
  message: string;

  @ApiProperty({ type: () => User })
  user: User;
}

export class ReviewSellerResponseDto {
  @ApiProperty({ example: 'John Doe berhasil disetujui sebagai Seller' })
  message: string;

  @ApiProperty({ type: () => User, nullable: true })
  user?: User;

  @ApiProperty({ example: 'Dokumen tidak valid', nullable: true })
  reason?: string;
}

export class UpdateOrderStatusResponseDto {
  @ApiProperty({ example: 'Status order ORD-20260603-0001 diubah dari pending ke processing' })
  message: string;

  @ApiProperty({ type: () => Order })
  order: Order;
}

export class ToggleProductResponseDto {
  @ApiProperty({ example: 'Produk Kain Tenun diaktifkan kembali' })
  message: string;

  @ApiProperty({ type: () => Product })
  product: Product;
}
