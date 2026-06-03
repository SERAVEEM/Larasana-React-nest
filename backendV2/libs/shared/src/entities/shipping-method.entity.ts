import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('shipping_methods')
export class ShippingMethod {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @ApiProperty({ example: 'jne' })
  @Column({ length: 50 })
  courier: string;

  @ApiProperty({ example: 'REG' })
  @Column({ length: 50 })
  service: string;

  @ApiProperty({ example: 'JNE Reguler' })
  @Column({ length: 100 })
  label: string;

  @ApiProperty({ example: '/images/jne.png', nullable: true })
  @Column({ name: 'logo_url', length: 500, nullable: true })
  logoUrl: string | null;

  @ApiProperty({ example: 10.00 })
  @Column({ name: 'base_cost', type: 'decimal', precision: 10, scale: 2, default: 0 })
  baseCost: number;

  @ApiProperty({ example: '2-3 hari' })
  @Column({ name: 'estimated_days', length: 30 })
  estimatedDays: string;

  @ApiProperty({ default: true })
  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
