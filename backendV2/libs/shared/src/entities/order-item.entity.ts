import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Order } from './order.entity';
import { Product } from './product.entity';
import { User } from './user.entity';

@Entity('order_items')
export class OrderItem {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @ApiProperty({ example: 1 })
  @Column({ name: 'order_id', unsigned: true })
  orderId: number;

  @ApiProperty({ example: 2, nullable: true })
  @Column({ name: 'product_id', unsigned: true, nullable: true })
  productId: number | null;

  @ApiProperty({ example: 3 })
  @Column({ name: 'seller_id', unsigned: true })
  sellerId: number;

  @ApiProperty({ example: 1 })
  @Column({ unsigned: true, default: 1 })
  quantity: number;

  @ApiProperty({ example: 120.00 })
  @Column({ name: 'unit_price', type: 'decimal', precision: 12, scale: 2 })
  unitPrice: number;

  @ApiProperty({ example: 120.00 })
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  subtotal: number;

  // Snapshot nama + gambar produk saat order dibuat
  // Supaya kalau produk dihapus, history tetap tampil
  @ApiProperty({
    example: { name: 'Kain Tenun Lombok', thumbnailUrl: '/images/t1.png', motif: 'Sasak' },
    nullable: true
  })
  @Column({ name: 'product_snapshot', type: 'json', nullable: true })
  productSnapshot: {
    name: string;
    thumbnailUrl: string | null;
    motif: string | null;
  } | null;

  @ManyToOne(() => Order, (o) => o.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ApiProperty({ type: () => Product, nullable: true })
  @ManyToOne(() => Product, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'seller_id' })
  seller: User;
}
