import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
  OneToOne, JoinColumn,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';

export type PaymentMethod =
  | 'qris'
  | 'bank_transfer'
  | 'va_bca'
  | 'va_bni'
  | 'va_bri'
  | 'va_mandiri'
  | 'gopay'
  | 'shopeepay';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'expired' | 'refunded';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ name: 'order_id', unsigned: true, unique: true })
  orderId: number;

  @Column({
    name: 'payment_method',
    type: 'enum',
    enum: ['qris','bank_transfer','va_bca','va_bni','va_bri','va_mandiri','gopay','shopeepay'],
    default: 'qris',
  })
  paymentMethod: PaymentMethod;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: ['pending','paid','failed','expired','refunded'],
    default: 'pending',
  })
  status: PaymentStatus;

  // Midtrans fields
  @Column({ name: 'midtrans_order_id', length: 100, nullable: true, unique: true })
  midtransOrderId: string | null;

  @Column({ name: 'midtrans_transaction_id', length: 100, nullable: true })
  midtransTransactionId: string | null;

  @Column({ name: 'payment_url', length: 1000, nullable: true })
  paymentUrl: string | null;

  @Column({ name: 'qr_string', type: 'text', nullable: true })
  qrString: string | null;

  @Column({ name: 'qr_image_url', length: 1000, nullable: true })
  qrImageUrl: string | null;

  @Column({ name: 'va_number', length: 50, nullable: true })
  vaNumber: string | null;

  @Column({ name: 'expiry_time', nullable: true })
  expiryTime: Date | null;

  @Column({ name: 'paid_at', nullable: true })
  paidAt: Date | null;

  @Column({ name: 'failed_reason', length: 255, nullable: true })
  failedReason: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;
}
