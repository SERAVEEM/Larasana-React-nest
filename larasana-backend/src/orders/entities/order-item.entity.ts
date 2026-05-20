import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../../products/entities/product.entity';
import { User } from '../../users/entities/user.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ name: 'order_id', unsigned: true })
  orderId: number;

  @Column({ name: 'product_id', unsigned: true })
  productId: number;

  @Column({ name: 'seller_id', unsigned: true })
  sellerId: number;

  @Column({ unsigned: true, default: 1 })
  quantity: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 12, scale: 2 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  subtotal: number;

  // Snapshot nama + gambar produk saat order dibuat
  // Supaya kalau produk dihapus, history tetap tampil
  @Column({ name: 'product_snapshot', type: 'json', nullable: true })
  productSnapshot: {
    name: string;
    thumbnailUrl: string | null;
    motif: string | null;
  } | null;

  @ManyToOne(() => Order, (o) => o.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Product, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'seller_id' })
  seller: User;
}
