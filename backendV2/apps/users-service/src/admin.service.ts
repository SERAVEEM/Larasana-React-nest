import {
  Injectable, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { User } from '../../../libs/shared/src';
import { Order } from '../../../libs/shared/src';
import { Payment } from '../../../libs/shared/src';
import { Product } from '../../../libs/shared/src';

interface SellerApplication {
  userId: number;
  user: User;
  status: string;
}

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,

    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,

    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async getDashboardStats() {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const totalUsers = await this.userRepo.count({ where: { isActive: true } });
    const totalBuyers = await this.userRepo.count({ where: { role: 'buyer', isActive: true } });
    const totalSellers = await this.userRepo.count({ where: { role: 'seller', isActive: true } });
    const totalOrders = await this.orderRepo.count();
    const pendingOrders = await this.orderRepo.count({ where: { status: 'pending' } });
    const totalProducts = await this.productRepo.count({ where: { isActive: true } });
    const totalRevenueObj = await this.paymentRepo
      .createQueryBuilder('p')
      .select('SUM(p.amount)', 'total')
      .where('p.status = :status', { status: 'paid' })
      .getRawOne();
    const totalRevenue = Number(totalRevenueObj?.total ?? 0);

    // Weekly change calculations
    const usersCurrent = await this.userRepo.createQueryBuilder('u')
      .where('u.createdAt >= :sevenDaysAgo AND u.isActive = 1', { sevenDaysAgo })
      .getCount();
    const usersPrevious = await this.userRepo.createQueryBuilder('u')
      .where('u.createdAt >= :fourteenDaysAgo AND u.createdAt < :sevenDaysAgo AND u.isActive = 1', { fourteenDaysAgo, sevenDaysAgo })
      .getCount();

    const ordersCurrent = await this.orderRepo.createQueryBuilder('o')
      .where('o.createdAt >= :sevenDaysAgo', { sevenDaysAgo })
      .getCount();
    const ordersPrevious = await this.orderRepo.createQueryBuilder('o')
      .where('o.createdAt >= :fourteenDaysAgo AND o.createdAt < :sevenDaysAgo', { fourteenDaysAgo, sevenDaysAgo })
      .getCount();

    const revenueCurrentObj = await this.paymentRepo.createQueryBuilder('p')
      .select('SUM(p.amount)', 'total')
      .where('p.status = :status AND p.createdAt >= :sevenDaysAgo', { status: 'paid', sevenDaysAgo })
      .getRawOne();
    const revenueCurrent = Number(revenueCurrentObj?.total ?? 0);

    const revenuePreviousObj = await this.paymentRepo.createQueryBuilder('p')
      .select('SUM(p.amount)', 'total')
      .where('p.status = :status AND p.createdAt >= :fourteenDaysAgo AND p.createdAt < :sevenDaysAgo', { status: 'paid', fourteenDaysAgo, sevenDaysAgo })
      .getRawOne();
    const revenuePrevious = Number(revenuePreviousObj?.total ?? 0);

    const productsNew = await this.productRepo.createQueryBuilder('prod')
      .where('prod.createdAt >= :sevenDaysAgo AND prod.isActive = 1', { sevenDaysAgo })
      .getCount();

    const calculatePercentageChange = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? '+100% from last week' : '0% from last week';
      const pct = ((curr - prev) / prev) * 100;
      const sign = pct >= 0 ? '+' : '';
      return `${sign}${pct.toFixed(0)}% from last week`;
    };

    const revenueChange = calculatePercentageChange(revenueCurrent, revenuePrevious);
    const ordersChange = calculatePercentageChange(ordersCurrent, ordersPrevious);
    const customersChange = calculatePercentageChange(usersCurrent, usersPrevious);
    const productsChange = productsNew > 0 ? `+${productsNew} new products this week` : 'Steady inventory';

    return {
      users: { total: totalUsers, buyers: totalBuyers, sellers: totalSellers, change: customersChange },
      orders: { total: totalOrders, pending: pendingOrders, change: ordersChange },
      products: { total: totalProducts, change: productsChange },
      revenue: { total: totalRevenue, change: revenueChange },
    };
  }

  // ── USER MANAGEMENT ────────────────────────────────────────

  async getAllUsers(query: any) {
    const { role, search, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<User>[] = [];

    if (search) {
      where.push(
        { name: Like(`%${search}%`), ...(role ? { role: role as any } : {}) },
        { email: Like(`%${search}%`), ...(role ? { role: role as any } : {}) },
      );
    } else {
      where.push({ ...(role ? { role: role as any } : {}) });
    }

    const [data, total] = await this.userRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getUserDetail(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User tidak ditemukan');
    return user;
  }

  async toggleUserActive(userId: number, isActive: boolean) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User tidak ditemukan');
    if (user.role === 'admin') throw new BadRequestException('Tidak bisa menonaktifkan akun admin');

    user.isActive = isActive;
    await this.userRepo.save(user);

    return {
      message: isActive
        ? `Akun ${user.name} berhasil diaktifkan`
        : `Akun ${user.name} berhasil dinonaktifkan`,
      user,
    };
  }

  // ── SELLER APPLICATIONS ────────────────────────────────────
  async getSellerApplications(query: any) {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const [data, total] = await this.userRepo.findAndCount({
      where: { role: 'seller' },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async reviewSeller(userId: number, decision: 'approved' | 'rejected', reason: string | undefined, adminId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User tidak ditemukan');
    if (user.role !== 'buyer') {
      throw new BadRequestException('User ini bukan buyer atau sudah jadi seller');
    }

    if (decision === 'approved') {
      user.role = 'seller';
      await this.userRepo.save(user);
      return { message: `${user.name} berhasil disetujui sebagai Seller`, user };
    }

    if (decision === 'rejected') {
      if (!reason) throw new BadRequestException('Alasan penolakan wajib diisi');
      return { message: `Pengajuan ${user.name} ditolak`, reason: reason };
    }
  }

  // ── ORDER MANAGEMENT ───────────────────────────────────────

  async getAllOrders(query: any) {
    const { status, search, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Order>[] = [];

    if (search) {
      where.push({ orderCode: Like(`%${search}%`), ...(status ? { status: status as any } : {}) });
    } else {
      where.push({ ...(status ? { status: status as any } : {}) });
    }

    const [data, total] = await this.orderRepo.findAndCount({
      where,
      relations: ['items', 'buyer'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getOrderDetail(orderId: number) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['items', 'items.product', 'buyer'],
    });
    if (!order) throw new NotFoundException('Order tidak ditemukan');

    const payment = await this.paymentRepo.findOne({ where: { orderId } });

    return { order, payment };
  }

  async updateOrderStatus(
    orderId: number,
    status: string,
    adminId: number,
  ) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order tidak ditemukan');
    }

    const prevStatus = order.status;
    order.status = status as any;
    await this.orderRepo.save(order);

    return {
      message: `Status order ${order.orderCode} diubah dari ${prevStatus} ke ${status}`,
      order,
    };
  }

  // ── PRODUCT MODERATION ─────────────────────────────────────

  async getAllProducts(search?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = search ? { name: Like(`%${search}%`) } : {};

    const [data, total] = await this.productRepo.findAndCount({
      where,
      relations: ['seller'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async toggleProductActive(productId: number, isActive: boolean) {
    const product = await this.productRepo.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Produk tidak ditemukan');

    product.isActive = isActive;
    await this.productRepo.save(product);

    return {
      message: isActive
        ? `Produk "${product.name}" diaktifkan kembali`
        : `Produk "${product.name}" dinonaktifkan`,
      product,
    };
  }
}
