import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
import { OrderItem } from './order-item.entity';

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

@Entity('orders')
export class Order {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @ApiProperty({ example: 'ORD-20260603-0001' })
  @Column({ name: 'order_code', length: 20, unique: true })
  orderCode: string;

  @ApiProperty({ example: 1 })
  @Column({ name: 'buyer_id', unsigned: true })
  buyerId: number;

  @ApiProperty({ example: 135.00 })
  @Column({ name: 'total_amount', type: 'decimal', precision: 12, scale: 2 })
  totalAmount: number;

  @ApiProperty({
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  })
  @Column({
    type: 'enum',
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  })
  status: OrderStatus;

  @ApiProperty({ example: 'John Doe' })
  @Column({ name: 'shipping_name', length: 100 })
  shippingName: string;

  @ApiProperty({ example: '08123456789' })
  @Column({ name: 'shipping_phone', length: 20 })
  shippingPhone: string;

  @ApiProperty({ example: 'Jl Senggigi Raya 12' })
  @Column({ name: 'shipping_address', type: 'text' })
  shippingAddress: string;

  @ApiProperty({ example: 'Lombok Barat' })
  @Column({ name: 'shipping_city', length: 100 })
  shippingCity: string;

  @ApiProperty({ example: 'Nusa Tenggara Barat' })
  @Column({ name: 'shipping_province', length: 100 })
  shippingProvince: string;

  @ApiProperty({ example: '83355' })
  @Column({ name: 'shipping_postal', length: 10 })
  shippingPostal: string;

  @ApiProperty({ example: 'Tolong dibungkus rapi', nullable: true })
  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @ApiProperty({ example: 15.00 })
  @Column({ name: 'shipping_cost', type: 'decimal', precision: 10, scale: 2, default: 0 })
  shippingCost: number;

  @ApiProperty({ nullable: true })
  @Column({ name: 'cancelled_at', nullable: true })
  cancelledAt: Date | null;

  @ApiProperty({ example: 'Ingin ganti motif', nullable: true })
  @Column({ name: 'cancel_reason', type: 'text', nullable: true })
  cancelReason: string | null;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'buyer_id' })
  buyer: User;

  @ApiProperty({ type: [OrderItem] })
  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true, eager: true })
  items: OrderItem[];
}
