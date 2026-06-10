import {
  Injectable, NotFoundException, BadRequestException, Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderItem, Payment, Product, Address, ShippingMethod } from '../../../libs/shared/src';
import { MidtransService } from './midtrans.service';
import { ShippingService } from './shipping.service';
import { CourierBookingService } from './courier-booking.service';

// Terminal payment states — once reached, webhooks must be ignored (idempotency guard)
const TERMINAL_PAYMENT_STATES = ['paid', 'expired', 'failed', 'refunded'] as const;
type TerminalPaymentState = typeof TERMINAL_PAYMENT_STATES[number];

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

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
    private readonly courierBookingService: CourierBookingService,
  ) {}

  // ---------------------------------------------------------------------------
  // CHECKOUT
  // ---------------------------------------------------------------------------

  async checkout(data: {
    user: { id: number; name: string; email: string };
    items: Array<{ productId: number; quantity: number }>;
    addressId: number;
    shippingMethodId: number;
    paymentMethod: string;
    notes?: string;
    weight?: number;
  }) {
    const { user, items, addressId, shippingMethodId, paymentMethod, notes } = data;

    // ── 1. Server-owned exchange rate (never trust client) ───────────────────
    const serverUsdRate = Number(process.env.RAJAONGKIR_USD_RATE ?? 15000);

    // ── 2. Validate address belongs to this user ─────────────────────────────
    const address = await this.addressRepo.findOne({ where: { id: addressId, userId: user.id } });
    if (!address) throw new NotFoundException('Alamat tidak ditemukan');

    // ── 3. Resolve products from DB — price & weight come from DB only ────────
    let productTotal = 0;
    let totalWeightGrams = 0;
    const resolved: Array<{
      product: Product;
      quantity: number;
      unitPrice: number;
      subtotal: number;
    }> = [];

    for (const item of items) {
      const product = await this.productRepo.findOne({ where: { id: item.productId, isActive: true } });
      if (!product) throw new NotFoundException(`Produk ID ${item.productId} tidak ditemukan`);

      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Stok produk "${product.name}" tidak mencukupi. Tersedia: ${product.stock}, diminta: ${item.quantity}`,
        );
      }

      const unitPrice = Number(product.price);
      const subtotal = unitPrice * item.quantity;
      productTotal += subtotal;

      // Server-side weight derivation (FLAW-03 fix)
      totalWeightGrams += (product.weightGrams ?? 500) * item.quantity;

      resolved.push({ product, quantity: item.quantity, unitPrice, subtotal });
    }

    // ── 4. Fetch shipping cost using server-derived weight ───────────────────
    const shipping = await this.shippingService.findById(
      shippingMethodId,
      addressId,
      totalWeightGrams,   // authoritative server weight — not the client hint
      serverUsdRate,      // server-owned rate
    );
    if (!shipping) throw new NotFoundException('Metode pengiriman tidak ditemukan');

    const shippingCost = Number(shipping.baseCost);
    const totalAmount = productTotal + shippingCost;

    // ── 5. Transactional order creation with pessimistic stock lock ──────────
    const order = await this.dataSource.transaction(async (manager) => {
      // Re-validate and lock stock inside the transaction to prevent race conditions (FLAW-05)
      for (const item of resolved) {
        const lockedProduct = await manager.findOne(Product, {
          where: { id: item.product.id, isActive: true },
          lock: { mode: 'pessimistic_write' },
        });

        if (!lockedProduct || lockedProduct.stock < item.quantity) {
          throw new BadRequestException(
            `Stok produk "${item.product.name}" tidak mencukupi (race condition check).`,
          );
        }

        // Atomically decrement stock
        await manager.decrement(Product, { id: item.product.id }, 'stock', item.quantity);
        // Increment sales counter
        await manager.increment(Product, { id: item.product.id }, 'sales', item.quantity);
      }

      const newOrder = manager.create(Order, {
        orderCode: this.generateOrderCode(),
        buyerId: user.id,
        totalAmount,
        status: 'pending',
        shippingName: address.recipientName,
        shippingPhone: address.phone,
        shippingAddress: address.fullAddress,
        shippingCity: address.city,
        shippingProvince: address.province,
        shippingPostal: address.postalCode,
        notes: notes ?? null,
        shippingCost,
        trackingNumber: null,
      });
      const saved = await manager.save(Order, newOrder);

      for (const item of resolved) {
        await manager.save(
          OrderItem,
          manager.create(OrderItem, {
            orderId: saved.id,
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
          }),
        );
      }

      return saved;
    });

    // ── 6. Charge Midtrans using the server-owned rate & dynamic conversion ───
    const midtransOrderId = `LRS-${order.orderCode}-${Date.now()}`;

    const isDomestic = address.country === 'ID';
    let idrProductTotal = 0;
    const idrItems = resolved.map((i) => {
      const itemPriceIDR = Math.round(i.unitPrice * serverUsdRate);
      idrProductTotal += itemPriceIDR * i.quantity;
      return {
        id: String(i.product.id),
        name: i.product.name.substring(0, 50),
        price: itemPriceIDR,
        quantity: i.quantity,
      };
    });

    let idrShippingCost = 0;
    if (isDomestic) {
      // Domestic checkout: Use product total (converted to IDR) + shipping fee (already in IDR)
      const originalCost = (shipping as any).originalCost;
      const originalCurrency = (shipping as any).originalCurrency;
      if (originalCurrency === 'IDR' && originalCost !== undefined) {
        idrShippingCost = Math.round(Number(originalCost));
      } else {
        idrShippingCost = Math.round(shippingCost * serverUsdRate);
      }
    } else {
      // International checkout: gross_amount = Math.round((Total Product Price + EasyPost Shipping Fee) * RAJAONGKIR_USD_RATE)
      const calculatedGrossAmount = Math.round(totalAmount * serverUsdRate);
      idrShippingCost = calculatedGrossAmount - idrProductTotal;
    }

    const idrTotalAmount = idrProductTotal + idrShippingCost;

    // Use Midtrans Snap Token API
    const result = await this.midtransService.createSnapTransaction({
      orderId: midtransOrderId,
      grossAmount: idrTotalAmount,
      customerName: user.name || 'Customer',
      customerEmail: user.email,
      customerPhone: address.phone || undefined,
      items: [
        ...idrItems,
        {
          id: `SHIP-${shipping.id}`,
          name: `Ongkir ${shipping.label}`.substring(0, 50),
          price: idrShippingCost,
          quantity: 1,
        },
      ],
      enabledPayments: this.getEnabledPayments(paymentMethod),
    });

    const expiryTime = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

    // ── 7. Persist payment record ─────────────────────────────────────────────
    const payment = await this.paymentRepo.save(
      this.paymentRepo.create({
        orderId: order.id,
        paymentMethod: paymentMethod as any,
        amount: totalAmount,
        status: 'pending',
        midtransOrderId,
        midtransTransactionId: null, // set during webhook
        snapToken: result.token,
        paymentUrl: result.redirect_url,
        qrString: null,
        qrImageUrl: null,
        vaNumber: null,
        expiryTime,
      }),
    );

    return {
      order: { id: order.id, orderCode: order.orderCode, totalAmount, status: order.status },
      payment: {
        id: payment.id,
        method: payment.paymentMethod,
        amount: payment.amount,
        status: payment.status,
        paymentUrl: payment.paymentUrl,
        snapToken: payment.snapToken,
        qrImageUrl: payment.qrImageUrl,
        vaNumber: payment.vaNumber,
        expiryTime: payment.expiryTime,
      },
    };
  }

  // ---------------------------------------------------------------------------
  // GET PAYMENT STATUS (polling)
  // ---------------------------------------------------------------------------

  async getPaymentStatus(userId: number, orderId: number, simulate?: string) {
    const order = await this.orderRepo.findOne({ where: { id: orderId, buyerId: userId } });
    if (!order) throw new NotFoundException('Order tidak ditemukan');

    const payment = await this.paymentRepo.findOne({ where: { orderId } });
    if (!payment) throw new NotFoundException('Data pembayaran tidak ditemukan');

    if (payment.status === 'pending') {
      let newStatus: any = payment.status;

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
          await this.restoreStock(orderId);
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
      snapToken: payment.snapToken,
      qrImageUrl: payment.qrImageUrl,
      vaNumber: payment.vaNumber,
      expiryTime: payment.expiryTime,
    };
  }

  // ---------------------------------------------------------------------------
  // WEBHOOK (idempotent, with amount cross-check)
  // ---------------------------------------------------------------------------

  async handleWebhook(payload: any) {
    const {
      order_id,
      transaction_status,
      fraud_status,
      gross_amount,
      status_code,
      signature_key,
      transaction_id,
    } = payload;

    // ── 1. Verify Midtrans signature ─────────────────────────────────────────
    const valid = this.midtransService.verifySignature(order_id, status_code, gross_amount, signature_key);
    if (!valid) {
      this.logger.warn(`Invalid Midtrans signature for order_id: ${order_id}`);
      throw new BadRequestException('Signature tidak valid');
    }

    const payment = await this.paymentRepo.findOne({ where: { midtransOrderId: order_id } });
    if (!payment) {
      this.logger.warn(`Webhook received for unknown order_id: ${order_id}. Silently ignored.`);
      return { received: true };
    }

    // ── 2. IDEMPOTENCY GUARD — skip if already in terminal state (FLAW-10) ───
    if ((TERMINAL_PAYMENT_STATES as readonly string[]).includes(payment.status)) {
      this.logger.warn(
        `Duplicate webhook for already-settled payment ${order_id} (status: ${payment.status}). Ignored.`,
      );
      return { received: true };
    }

    // ── 3. AMOUNT CROSS-CHECK — verify gross_amount matches DB record (FLAW-12) ─
    const serverUsdRate = Number(process.env.RAJAONGKIR_USD_RATE ?? 15000);
    const expectedAmountIDR = Math.round(Number(payment.amount) * serverUsdRate);
    const receivedAmountIDR = Math.round(Number(gross_amount));
    const AMOUNT_TOLERANCE_IDR = 100; // Allow ±100 IDR rounding tolerance

    if (Math.abs(receivedAmountIDR - expectedAmountIDR) > AMOUNT_TOLERANCE_IDR) {
      this.logger.error(
        `[SECURITY ALERT] Amount mismatch for ${order_id}! ` +
        `Expected: IDR ${expectedAmountIDR}, Received: IDR ${receivedAmountIDR}. ` +
        `Difference: IDR ${Math.abs(receivedAmountIDR - expectedAmountIDR)}. Rejecting webhook.`,
      );
      throw new BadRequestException('Jumlah pembayaran tidak sesuai dengan catatan order');
    }

    // ── 4. Map new status and apply state transition ─────────────────────────
    const newStatus = this.mapStatus(transaction_status, fraud_status);
    payment.status = newStatus;
    payment.midtransTransactionId = transaction_id;

    if (newStatus === 'paid') {
      // Only set paidAt once — first webhook wins (idempotency)
      if (!payment.paidAt) {
        payment.paidAt = new Date();
      }

      // Transition order → processing
      await this.orderRepo.update(payment.orderId, { status: 'processing' });

      // ── 5. Trigger async courier booking (FLAW-11) ───────────────────────
      const order = await this.orderRepo.findOne({ where: { id: payment.orderId } });
      if (order) {
        this.courierBookingService.bookAfterPayment(order, payment).catch((err) => {
          this.logger.error(`Courier booking failed for Order #${payment.orderId}: ${err?.message}`);
        });
      }
    }

    if (newStatus === 'expired' || newStatus === 'failed') {
      await this.orderRepo.update(payment.orderId, { status: 'cancelled' });
      // Restore stock on failure/expiry
      await this.restoreStock(payment.orderId);
    }

    await this.paymentRepo.save(payment);
    return { received: true };
  }

  // ---------------------------------------------------------------------------
  // PRIVATE HELPERS
  // ---------------------------------------------------------------------------

  private mapStatus(ts: string, fs?: string): any {
    if (ts === 'capture') return fs === 'accept' ? 'paid' : 'failed';
    return ({
      settlement: 'paid',
      pending: 'pending',
      deny: 'failed',
      cancel: 'failed',
      expire: 'expired',
      refund: 'refunded',
    })[ts] ?? 'pending';
  }

  private async restoreStock(orderId: number): Promise<void> {
    try {
      const items = await this.orderItemRepo.find({ where: { orderId } });
      for (const item of items) {
        await this.productRepo.increment({ id: item.productId }, 'stock', item.quantity);
        await this.productRepo.decrement({ id: item.productId }, 'sales', item.quantity);
      }
      this.logger.log(`Stock restored for Order #${orderId} (${items.length} item(s))`);
    } catch (err: any) {
      this.logger.error(`Failed to restore stock for Order #${orderId}: ${err?.message}`);
    }
  }

  private generateOrderCode(): string {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return `LRS-${date}-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  private getEnabledPayments(method: string): string[] | undefined {
    switch (method) {
      case 'qris':
        return ['other_qris', 'gopay', 'shopeepay'];
      case 'va_bca':
        return ['bca_va'];
      case 'va_bni':
        return ['bni_va'];
      case 'va_bri':
        return ['bri_va'];
      case 'va_mandiri':
        return ['echannel'];
      case 'gopay':
        return ['gopay', 'other_qris'];
      case 'shopeepay':
        return ['shopeepay', 'other_qris'];
      case 'credit_card':
        return ['credit_card'];
      case 'bank_transfer':
        return ['bca_va', 'bni_va', 'bri_va', 'echannel', 'permata_va'];
      default:
        return undefined;
    }
  }
}
