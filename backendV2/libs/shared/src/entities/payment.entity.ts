import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
  OneToOne, JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Order } from './order.entity';

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
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @ApiProperty({ example: 1 })
  @Column({ name: 'order_id', unsigned: true, unique: true })
  orderId: number;

  @ApiProperty({
    enum: ['qris','bank_transfer','va_bca','va_bni','va_bri','va_mandiri','gopay','shopeepay'],
    default: 'qris',
  })
  @Column({
    name: 'payment_method',
    type: 'enum',
    enum: ['qris','bank_transfer','va_bca','va_bni','va_bri','va_mandiri','gopay','shopeepay'],
    default: 'qris',
  })
  paymentMethod: PaymentMethod;

  @ApiProperty({ example: 120.00 })
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @ApiProperty({
    enum: ['pending','paid','failed','expired','refunded'],
    default: 'pending',
  })
  @Column({
    type: 'enum',
    enum: ['pending','paid','failed','expired','refunded'],
    default: 'pending',
  })
  status: PaymentStatus;

  // Midtrans fields
  @ApiProperty({ example: 'MID-ORD-20260603-0001', nullable: true })
  @Column({ name: 'midtrans_order_id', length: 100, nullable: true, unique: true })
  midtransOrderId: string | null;

  @ApiProperty({ example: 'midtrans-tx-12345', nullable: true })
  @Column({ name: 'midtrans_transaction_id', length: 100, nullable: true })
  midtransTransactionId: string | null;

  @ApiProperty({ example: 'https://app.sandbox.midtrans.com/snap/v2/vtlink/123', nullable: true })
  @Column({ name: 'payment_url', length: 1000, nullable: true })
  paymentUrl: string | null;

  @ApiProperty({ example: 'qr_string_data', nullable: true })
  @Column({ name: 'qr_string', type: 'text', nullable: true })
  qrString: string | null;

  @ApiProperty({ example: 'https://example.com/qr.png', nullable: true })
  @Column({ name: 'qr_image_url', length: 1000, nullable: true })
  qrImageUrl: string | null;

  @ApiProperty({ example: '1234567890', nullable: true })
  @Column({ name: 'va_number', length: 50, nullable: true })
  vaNumber: string | null;

  @ApiProperty({ nullable: true })
  @Column({ name: 'expiry_time', nullable: true })
  expiryTime: Date | null;

  @ApiProperty({ nullable: true })
  @Column({ name: 'paid_at', nullable: true })
  paidAt: Date | null;

  @ApiProperty({ example: 'Limit exceeded', nullable: true })
  @Column({ name: 'failed_reason', length: 255, nullable: true })
  failedReason: string | null;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;
}
