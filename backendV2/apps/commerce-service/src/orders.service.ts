import {
  Injectable, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Order } from '../../../libs/shared/src';

@Injectable()
export class OrdersService {
  constructor(@InjectRepository(Order) private orderRepo: Repository<Order>) {}

  async getMyOrders(query: { userId: number; status?: string; search?: string; page?: number; limit?: number }) {
    const { userId, status, search, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Order>[] = [];
    if (search) {
      where.push({ buyerId: userId, orderCode: Like(`%${search}%`), ...(status ? { status: status as any } : {}) });
    } else {
      where.push({ buyerId: userId, ...(status ? { status: status as any } : {}) });
    }

    const [data, total] = await this.orderRepo.findAndCount({
      where, relations: ['items'], order: { createdAt: 'DESC' }, skip, take: limit,
    });

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getOrderDetail(userId: number, orderId: number) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, buyerId: userId },
      relations: ['items', 'items.product'],
    });
    if (!order) throw new NotFoundException('Order tidak ditemukan');
    return order;
  }

  async cancelOrder(userId: number, orderId: number, reason?: string) {
    const order = await this.orderRepo.findOne({ where: { id: orderId, buyerId: userId } });
    if (!order) throw new NotFoundException('Order tidak ditemukan');
    if (order.status !== 'pending') throw new BadRequestException(`Order tidak bisa dibatalkan. Status: ${order.status}`);

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancelReason = reason ?? 'Dibatalkan oleh pembeli';
    return this.orderRepo.save(order);
  }

  static generateOrderCode(): string {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return `LRS-${date}-${Math.floor(1000 + Math.random() * 9000)}`;
  }
}
