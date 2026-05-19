import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('product_images')
export class ProductImage {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ name: 'product_id', unsigned: true })
  productId: number;

  @Column({ length: 500 })
  url: string;

  @Column({ name: 'sort_order', unsigned: true, default: 0 })
  sortOrder: number;

  @ManyToOne(() => Product, (p) => p.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
