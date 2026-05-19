import {
  Injectable, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Order } from '../orders/entities/order.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Product } from '../products/entities/product.entity';
import {
  AdminUserQueryDto,
  AdminSellerQueryDto,
  AdminOrderQueryDto,
  AdminUpdateOrderStatusDto,
  ReviewSellerDto,
} from './dto/admin.dto';

// Seller profile masih pakai interface sederhana
// karena SellerProfile entity belum dibuat — sesuai scope project
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

  // ── DASHBOARD STATS ────────────────────────────────────────
  // Overview singkat untuk halaman utama admin
  async getDashboardStats() {
    const [
      totalUsers,
      totalBuyers,
      totalSellers,
      totalOrders,
      pendingOrders,
      totalProducts,
      totalRevenue,
    ] = await Promise.all([
      this.userRepo.count({ where: { isActive: true } }),
      this.userRepo.count({ where: { role: 'buyer', isActive: true } }),
      this.userRepo.count({ where: { role: 'seller', isActive: true } }),
      this.orderRepo.count(),
      this.orderRepo.count({ where: { status: 'pending' } }),
      this.productRepo.count({ where: { isActive: true } }),
      this.paymentRepo
        .createQueryBuilder('p')
        .select('SUM(p.amount)', 'total')
        .where('p.status = :status', { status: 'paid' })
        .getRawOne(),
    ]);

    return {
      users: { total: totalUsers, buyers: totalBuyers, sellers: totalSellers },
      orders: { total: totalOrders, pending: pendingOrders },
      products: { total: totalProducts },
      revenue: { total: Number(totalRevenue?.total ?? 0) },
    };
  }

  // ── USER MANAGEMENT ────────────────────────────────────────

  async getAllUsers(query: AdminUserQueryDto) {
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

  // Nonaktifkan / aktifkan akun user
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
  // Ambil semua user dengan role buyer yang pernah apply seller
  // (dalam implementasi penuh ini pakai tabel seller_profiles)
  // Untuk sekarang: tampilkan user dengan role buyer sebagai pending list
  async getSellerApplications(query: AdminSellerQueryDto) {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    // Ambil semua seller yang sudah approved (role = seller)
    // dan buyer yang belum (simulasi pending)
    const [data, total] = await this.userRepo.findAndCount({
      where: { role: 'seller' },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // Approve seller — upgrade role dari buyer ke seller
  async reviewSeller(userId: number, dto: ReviewSellerDto, adminId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User tidak ditemukan');
    if (user.role !== 'buyer') {
      throw new BadRequestException('User ini bukan buyer atau sudah jadi seller');
    }

    if (dto.decision === 'approved') {
      user.role = 'seller';
      await this.userRepo.save(user);
      return { message: `${user.name} berhasil disetujui sebagai Seller`, user };
    }

    if (dto.decision === 'rejected') {
      if (!dto.reason) throw new BadRequestException('Alasan penolakan wajib diisi');
      // Bisa kirim email notifikasi reject di sini
      return { message: `Pengajuan ${user.name} ditolak`, reason: dto.reason };
    }
  }

  // ── ORDER MANAGEMENT ───────────────────────────────────────

  async getAllOrders(query: AdminOrderQueryDto) {
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

  // Admin bisa manual update status order
  // misal: tandai sudah shipped setelah input resi
  async updateOrderStatus(orderId: number, dto: AdminUpdateOrderStatusDto, adminId: number) {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order tidak ditemukan');

    const prevStatus = order.status;
    order.status = dto.status as any;
    await this.orderRepo.save(order);

    return {
      message: `Status order ${order.orderCode} diubah dari ${prevStatus} ke ${dto.status}`,
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

  // Nonaktifkan produk yang melanggar (misal: bukan tenun asli)
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
