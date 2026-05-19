import {
  Injectable, BadRequestException, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Product } from '../products/entities/product.entity';
import { AddressesService } from '../addresses/addresses.service';
import { ShippingService } from '../shipping/shipping.service';
import { MidtransService } from '../payments/midtrans.service';
import { OrdersService } from '../orders/orders.service';
import { CheckoutDto } from './dto/checkout.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CheckoutService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,

    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,

    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,

    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,

    private readonly addressesService: AddressesService,
    private readonly shippingService: ShippingService,
    private readonly midtransService: MidtransService,
    private readonly dataSource: DataSource,
  ) {}

  async checkout(user: User, dto: CheckoutDto) {
    // ── 1. Validasi alamat & shipping milik user ──────────────
    const address = await this.addressesService.findOneOrFail(user.id, dto.addressId);
    const shippingMethod = await this.shippingService.findById(dto.shippingMethodId);

    // ── 2. Validasi semua produk & hitung total ───────────────
    let productTotal = 0;
    const resolvedItems: Array<{
      product: Product;
      quantity: number;
      unitPrice: number;
      subtotal: number;
    }> = [];

    for (const item of dto.items) {
      const product = await this.productRepo.findOne({
        where: { id: item.productId, isActive: true },
      });

      if (!product) {
        throw new NotFoundException(`Produk ID ${item.productId} tidak ditemukan`);
      }
      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Stok produk "${product.name}" tidak cukup. Tersisa: ${product.stock}`,
        );
      }

      const subtotal = Number(product.price) * item.quantity;
      productTotal += subtotal;

      resolvedItems.push({
        product,
        quantity: item.quantity,
        unitPrice: Number(product.price),
        subtotal,
      });
    }

    const shippingCost = Number(shippingMethod.baseCost);
    const totalAmount = productTotal + shippingCost;

    // ── 3. Buat order + items + kurangi stok (dalam 1 transaksi DB) ──
    const order = await this.dataSource.transaction(async (manager) => {
      const orderCode = OrdersService.generateOrderCode();

      const newOrder = manager.create(Order, {
        orderCode,
        buyerId: user.id,
        totalAmount,
        status: 'pending',
        shippingName: address.recipientName,
        shippingPhone: address.phone,
        shippingAddress: address.fullAddress,
        shippingCity: address.city,
        shippingProvince: address.province,
        shippingPostal: address.postalCode,
        notes: dto.notes ?? null,
        shippingCost,
      });

      const savedOrder = await manager.save(Order, newOrder);

      for (const item of resolvedItems) {
        const orderItem = manager.create(OrderItem, {
          orderId: savedOrder.id,
          productId: item.product.id,
          sellerId: item.product.sellerId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
          productSnapshot: {
            name: item.product.name,
            thumbnailUrl: item.product.thumbnailUrl,
            motif: item.product.motif,
          },
        });
        await manager.save(OrderItem, orderItem);

        // Kurangi stok
        await manager.decrement(Product, { id: item.product.id }, 'stock', item.quantity);
      }

      return savedOrder;
    });

    // ── 4. Buat transaksi di Midtrans ─────────────────────────
    const midtransOrderId = `LRS-${order.orderCode}-${Date.now()}`;

    const midtransResult = await this.midtransService.charge({
      orderId: midtransOrderId,
      amount: totalAmount,
      customerName: user.name,
      customerEmail: user.email,
      items: [
        ...resolvedItems.map((i) => ({
          id: String(i.product.id),
          name: i.product.name,
          price: i.unitPrice,
          quantity: i.quantity,
        })),
        {
          id: `SHIPPING-${shippingMethod.id}`,
          name: `Ongkir ${shippingMethod.label}`,
          price: shippingCost,
          quantity: 1,
        },
      ],
      paymentMethod: dto.paymentMethod as any,
    });

    // ── 5. Simpan data payment ke DB ──────────────────────────
    const payment = this.paymentRepo.create({
      orderId: order.id,
      paymentMethod: dto.paymentMethod as any,
      amount: totalAmount,
      status: 'pending',
      midtransOrderId,
      midtransTransactionId: midtransResult.midtransTransactionId,
      paymentUrl: midtransResult.paymentUrl,
      qrString: midtransResult.qrString,
      qrImageUrl: midtransResult.qrImageUrl,
      vaNumber: midtransResult.vaNumber,
      expiryTime: midtransResult.expiryTime,
    });

    await this.paymentRepo.save(payment);

    // ── 6. Return ke frontend ─────────────────────────────────
    return {
      order: {
        id: order.id,
        orderCode: order.orderCode,
        totalAmount,
        status: order.status,
      },
      payment: {
        id: payment.id,
        method: payment.paymentMethod,
        amount: payment.amount,
        status: payment.status,
        paymentUrl: payment.paymentUrl,      // untuk redirect Snap
        qrImageUrl: payment.qrImageUrl,      // untuk tampilkan QR QRIS
        qrString: payment.qrString,
        vaNumber: payment.vaNumber,          // untuk VA
        expiryTime: payment.expiryTime,
      },
    };
  }

  // ── GET PAYMENT STATUS ─────────────────────────────────────
  // Dipakai polling dari frontend untuk cek apakah sudah bayar
  async getPaymentStatus(userId: number, orderId: number) {
    const order = await this.orderRepo.findOne({ where: { id: orderId, buyerId: userId } });
    if (!order) throw new NotFoundException('Order tidak ditemukan');

    const payment = await this.paymentRepo.findOne({ where: { orderId } });
    if (!payment) throw new NotFoundException('Data pembayaran tidak ditemukan');

    // Sync status dari Midtrans kalau masih pending
    if (payment.status === 'pending' && payment.midtransOrderId) {
      const mtStatus = await this.midtransService.getStatus(payment.midtransOrderId);
      const updatedStatus = this.mapMidtransStatus(mtStatus.transaction_status, mtStatus.fraud_status);

      if (updatedStatus !== payment.status) {
        payment.status = updatedStatus;
        if (updatedStatus === 'paid') {
          payment.paidAt = new Date();
          payment.midtransTransactionId = mtStatus.transaction_id;
          await this.orderRepo.update(orderId, { status: 'processing' });
        }
        if (updatedStatus === 'expired' || updatedStatus === 'failed') {
          await this.orderRepo.update(orderId, { status: 'cancelled' });
        }
        await this.paymentRepo.save(payment);
      }
    }

    return {
      orderId,
      orderStatus: order.status,
      paymentStatus: payment.status,
      paidAt: payment.paidAt,
    };
  }

  // ── WEBHOOK dari Midtrans ──────────────────────────────────
  async handleWebhook(payload: any): Promise<void> {
    const {
      order_id, transaction_status, fraud_status,
      gross_amount, status_code, signature_key, transaction_id,
    } = payload;

    // Verifikasi signature dari Midtrans
    const isValid = this.midtransService.verifySignature(
      order_id, status_code, gross_amount, signature_key,
    );
    if (!isValid) throw new BadRequestException('Signature tidak valid');

    const payment = await this.paymentRepo.findOne({
      where: { midtransOrderId: order_id },
    });
    if (!payment) return;

    const newStatus = this.mapMidtransStatus(transaction_status, fraud_status);
    payment.status = newStatus;
    payment.midtransTransactionId = transaction_id;

    if (newStatus === 'paid') {
      payment.paidAt = new Date();
      await this.orderRepo.update(payment.orderId, { status: 'processing' });
    }
    if (newStatus === 'expired' || newStatus === 'failed') {
      await this.orderRepo.update(payment.orderId, { status: 'cancelled' });
    }

    await this.paymentRepo.save(payment);
  }

  private mapMidtransStatus(transactionStatus: string, fraudStatus?: string): any {
    if (transactionStatus === 'capture') {
      return fraudStatus === 'accept' ? 'paid' : 'failed';
    }
    const map: Record<string, string> = {
      settlement: 'paid',
      pending: 'pending',
      deny: 'failed',
      cancel: 'failed',
      expire: 'expired',
      refund: 'refunded',
    };
    return map[transactionStatus] ?? 'pending';
  }
}
