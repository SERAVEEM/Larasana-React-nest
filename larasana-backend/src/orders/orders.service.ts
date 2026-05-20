import {
  Injectable, NotFoundException, ForbiddenException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderQueryDto } from './dto/order-query.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';

export interface PaginatedOrders {
  data: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  // ── GET ORDER HISTORY ──────────────────────────────────────
  // Dipakai halaman "Order History" di dashboard
  // Bisa filter status + search kode order
  async getMyOrders(userId: number, query: OrderQueryDto): Promise<PaginatedOrders> {
    const { status, search, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Order>[] = [];

    // Build where condition
    // Kalau ada search, cari di orderCode ATAU nama produk di snapshot
    if (search) {
      const likeSearch = Like(`%${search}%`);
      where.push(
        { buyerId: userId, orderCode: likeSearch, ...(status ? { status: status as any } : {}) },
      );
    } else {
      where.push({
        buyerId: userId,
        ...(status ? { status: status as any } : {}),
      });
    }

    const [data, total] = await this.orderRepo.findAndCount({
      where,
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ── GET ORDER DETAIL ───────────────────────────────────────
  async getOrderDetail(userId: number, orderId: number): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, buyerId: userId },
      relations: ['items', 'items.product', 'items.product.images'],
    });

    if (!order) throw new NotFoundException('Order tidak ditemukan');
    return order;
  }

  // ── CANCEL ORDER ───────────────────────────────────────────
  // Hanya bisa cancel kalau status masih 'pending'
  async cancelOrder(userId: number, orderId: number, dto: CancelOrderDto): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, buyerId: userId },
    });

    if (!order) throw new NotFoundException('Order tidak ditemukan');

    if (order.buyerId !== userId) {
      throw new ForbiddenException('Anda tidak berhak membatalkan order ini');
    }

    if (order.status !== 'pending') {
      throw new BadRequestException(
        `Order tidak bisa dibatalkan. Status saat ini: ${order.status}`,
      );
    }

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancelReason = dto.reason ?? 'Dibatalkan oleh pembeli';

    return this.orderRepo.save(order);
  }

  // ── HELPER: Generate order code ────────────────────────────
  // Format: LRS-YYYYMMDD-XXXX
  static generateOrderCode(): string {
    const now = new Date();
    const date = now.toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `LRS-${date}-${rand}`;
  }
}
