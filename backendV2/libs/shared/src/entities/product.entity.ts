import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, DeleteDateColumn,
  ManyToOne, JoinColumn, OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
import { ProductImage } from './product-image.entity';

@Entity('products')
export class Product {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @ApiProperty({ example: 2 })
  @Column({ name: 'seller_id', unsigned: true })
  sellerId: number;

  @ApiProperty({ example: 'Kain Tenun Lombok' })
  @Column({ length: 200 })
  name: string;

  @ApiProperty({ example: 'kain-tenun-lombok' })
  @Column({ length: 220, unique: true })
  slug: string;

  @ApiProperty({ example: 'Deskripsi lengkap produk kain tenun.' })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiProperty({ example: 120.00 })
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: number;

  @ApiProperty({ example: 100 })
  @Column({ unsigned: true, default: 0 })
  stock: number;

  @ApiProperty({ example: 'SKU-TENUN-01', nullable: true })
  @Column({ length: 50, nullable: true })
  sku: string | null;

  @ApiProperty({ type: [String], example: ['S', 'M', 'L'] })
  @Column({ type: 'simple-json', nullable: true })
  sizes: string[] | null;

  @ApiProperty({ example: 'https://example.com/qr.png', nullable: true })
  @Column({ name: 'qr_code_url', length: 500, nullable: true })
  qrCodeUrl: string | null;

  @ApiProperty({ example: 5 })
  @Column({ unsigned: true, default: 0 })
  sales: number;

  @ApiProperty({ example: 'Kain Tenun' })
  @Column({ length: 100, nullable: true })
  category: string | null;

  @ApiProperty({ example: 'Suku Sasak' })
  @Column({ length: 100, nullable: true })
  motif: string | null;

  @ApiProperty({ example: 'Benang Sutra' })
  @Column({ length: 100, nullable: true })
  material: string | null;

  @ApiProperty({ example: 'https://example.com/thumb.jpg' })
  @Column({ name: 'thumbnail_url', length: 500, nullable: true })
  thumbnailUrl: string | null;

  @ApiProperty({ default: true })
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ApiProperty({ example: 4.8 })
  @Column({ name: 'average_rating', type: 'decimal', precision: 3, scale: 2, default: 0 })
  averageRating: number;

  @ApiProperty({ example: 10 })
  @Column({ name: 'total_reviews', unsigned: true, default: 0 })
  totalReviews: number;

  @ApiProperty({ example: 500, description: 'Berat produk dalam gram (digunakan untuk kalkulasi ongkir)' })
  @Column({ name: 'weight_grams', unsigned: true, default: 500 })
  weightGrams: number;

  @ApiProperty({ example: 'Inaq Sri' })
  @Column({ name: 'weaver_name', length: 100, nullable: true })
  weaverName: string | null;

  @ApiProperty({ example: 'Bio penenun tradisional Lombok.' })
  @Column({ name: 'weaver_bio', type: 'text', nullable: true })
  weaverBio: string | null;

  @ApiProperty({ example: '/images/weaver/sri.png' })
  @Column({ name: 'weaver_image_url', length: 500, nullable: true })
  weaverImageUrl: string | null;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'seller_id' })
  seller: User;

  @OneToMany(() => ProductImage, (img) => img.product, { cascade: true })
  images: ProductImage[];
}
