import {
  Injectable, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderItem, Payment, Product, Address, ShippingMethod } from '../../../libs/shared/src';
import { MidtransService } from './midtrans.service';
import { ShippingService } from './shipping.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private orderItemRepo: Repository<OrderItem>,
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(Address) private addressRepo: Repository<Address>,
    @InjectRepository(ShippingMethod) private shippingRepo: Repository<ShippingMethod>,
    private midtransService: MidtransService,
    private dataSource: DataSource,
    private readonly shippingService: ShippingService,
  ) { }

  async checkout(data: {
    user: { id: number; name: string; email: string };
    items: Array<{ productId: number; quantity: number }>;
    addressId: number;
    shippingMethodId: number;
    paymentMethod: string;
    notes?: string;
  }) {
    const { user, items, addressId, shippingMethodId, paymentMethod, notes } = data;

    const address = await this.addressRepo.findOne({ where: { id: addressId, userId: user.id } });
    if (!address) throw new NotFoundException('Alamat tidak ditemukan');

    const shipping = await this.shippingService.findById(shippingMethodId, addressId);
    if (!shipping) throw new NotFoundException('Metode pengiriman tidak ditemukan');

    let productTotal = 0;
    const resolved = [];

    for (const item of items) {
      const product = await this.productRepo.findOne({ where: { id: item.productId, isActive: true } });
      if (!product) throw new NotFoundException(`Produk ID ${item.productId} tidak ditemukan`);

      const subtotal = Number(product.price) * item.quantity;
      productTotal += subtotal;
      resolved.push({ product, quantity: item.quantity, unitPrice: Number(product.price), subtotal });
    }

    const shippingCost = Number(shipping.baseCost);
    const totalAmount = productTotal + shippingCost;

    const order = await this.dataSource.transaction(async (manager) => {
      const newOrder = manager.create(Order, {
        orderCode: this.generateOrderCode(),
        buyerId: user.id,
        totalAmount, status: 'pending',
        shippingName: address.recipientName,
        shippingPhone: address.phone,
        shippingAddress: address.fullAddress,
        shippingCity: address.city,
        shippingProvince: address.province,
        shippingPostal: address.postalCode,
        notes: notes ?? null, shippingCost,
      });
      const saved = await manager.save(Order, newOrder);

      for (const item of resolved) {
        await manager.save(OrderItem, manager.create(OrderItem, {
          orderId: saved.id, productId: item.product.id,
          sellerId: item.product.sellerId, quantity: item.quantity,
          unitPrice: item.unitPrice, subtotal: item.subtotal,
          productSnapshot: { name: item.product.name, thumbnailUrl: item.product.thumbnailUrl, motif: item.product.motif },
        }));
      }
      return saved;
    });

    const midtransOrderId = `LRS-${order.orderCode}-${Date.now()}`;
    const result = await this.midtransService.charge({
      orderId: midtransOrderId, amount: totalAmount,
      customerName: user.name, customerEmail: user.email,
      items: [
        ...resolved.map(i => ({ id: String(i.product.id), name: i.product.name, price: i.unitPrice, quantity: i.quantity })),
        { id: `SHIP-${shipping.id}`, name: `Ongkir ${shipping.label}`, price: shippingCost, quantity: 1 },
      ],
      paymentMethod: paymentMethod as any,
    });

    const payment = await this.paymentRepo.save(this.paymentRepo.create({
      orderId: order.id, paymentMethod: paymentMethod as any,
      amount: totalAmount, status: 'pending',
      midtransOrderId, midtransTransactionId: result.midtransTransactionId,
      paymentUrl: result.paymentUrl, qrString: result.qrString,
      qrImageUrl: result.qrImageUrl, vaNumber: result.vaNumber,
      expiryTime: result.expiryTime,
    }));

    return {
      order: { id: order.id, orderCode: order.orderCode, totalAmount, status: order.status },
      payment: {
        id: payment.id, method: payment.paymentMethod, amount: payment.amount,
        status: payment.status, paymentUrl: payment.paymentUrl,
        qrImageUrl: payment.qrImageUrl, vaNumber: payment.vaNumber,
        expiryTime: payment.expiryTime,
      },
    };
  }

  async getPaymentStatus(userId: number, orderId: number, simulate?: string) {
    const order = await this.orderRepo.findOne({ where: { id: orderId, buyerId: userId } });
    if (!order) throw new NotFoundException('Order tidak ditemukan');

    const payment = await this.paymentRepo.findOne({ where: { orderId } });
    if (!payment) throw new NotFoundException('Data pembayaran tidak ditemukan');

    if (payment.status === 'pending') {
      let newStatus: any = payment.status;

      // Dev-only: instant success simulation via mock backend
      if (simulate === 'success' && this.midtransService.isMockMode) {
        newStatus = 'paid';
      } else if (payment.midtransOrderId) {
        const mt = await this.midtransService.getStatus(payment.midtransOrderId);
        newStatus = this.mapStatus(mt.transaction_status, mt.fraud_status);
      }

      if (newStatus !== payment.status) {
        payment.status = newStatus;
        if (newStatus === 'paid') {
          payment.paidAt = new Date();
          await this.orderRepo.update(orderId, { status: 'processing' });
          order.status = 'processing';
        }
        if (newStatus === 'expired' || newStatus === 'failed') {
          await this.orderRepo.update(orderId, { status: 'cancelled' });
          order.status = 'cancelled';
        }
        await this.paymentRepo.save(payment);
      }
    }

    return {
      orderId,
      orderStatus: order.status,
      paymentStatus: payment.status,
      paidAt: payment.paidAt,
      paymentMethod: payment.paymentMethod,
      amount: payment.amount,
      paymentUrl: payment.paymentUrl,
      qrImageUrl: payment.qrImageUrl,
      vaNumber: payment.vaNumber,
      expiryTime: payment.expiryTime,
    };
  }

  async handleWebhook(payload: any) {
    const { order_id, transaction_status, fraud_status, gross_amount, status_code, signature_key, transaction_id } = payload;
    const valid = this.midtransService.verifySignature(order_id, status_code, gross_amount, signature_key);
    if (!valid) throw new BadRequestException('Signature tidak valid');

    const payment = await this.paymentRepo.findOne({ where: { midtransOrderId: order_id } });
    if (!payment) return;

    const newStatus = this.mapStatus(transaction_status, fraud_status);
    payment.status = newStatus;
    payment.midtransTransactionId = transaction_id;
    if (newStatus === 'paid') { payment.paidAt = new Date(); await this.orderRepo.update(payment.orderId, { status: 'processing' }); }
    if (newStatus === 'expired' || newStatus === 'failed') await this.orderRepo.update(payment.orderId, { status: 'cancelled' });
    await this.paymentRepo.save(payment);
    return { received: true };
  }

  private mapStatus(ts: string, fs?: string): any {
    if (ts === 'capture') return fs === 'accept' ? 'paid' : 'failed';
    return ({ settlement: 'paid', pending: 'pending', deny: 'failed', cancel: 'failed', expire: 'expired', refund: 'refunded' })[ts] ?? 'pending';
  }

  private generateOrderCode(): string {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return `LRS-${date}-${Math.floor(1000 + Math.random() * 9000)}`;
  }
}
