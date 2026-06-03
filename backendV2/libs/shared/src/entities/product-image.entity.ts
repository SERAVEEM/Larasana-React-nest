import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Product } from './product.entity';

@Entity('product_images')
export class ProductImage {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @ApiProperty({ example: 1 })
  @Column({ name: 'product_id', unsigned: true })
  productId: number;

  @ApiProperty({ example: 'https://example.com/image.jpg' })
  @Column({ length: 500 })
  url: string;

  @ApiProperty({ example: 0 })
  @Column({ name: 'sort_order', unsigned: true, default: 0 })
  sortOrder: number;

  @ManyToOne(() => Product, (p) => p.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
