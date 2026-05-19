import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('shipping_methods')
export class ShippingMethod {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ length: 50 })
  courier: string;

  @Column({ length: 50 })
  service: string;

  @Column({ length: 100 })
  label: string;

  @Column({ name: 'logo_url', length: 500, nullable: true })
  logoUrl: string | null;

  @Column({ name: 'base_cost', type: 'decimal', precision: 10, scale: 2, default: 0 })
  baseCost: number;

  @Column({ name: 'estimated_days', length: 30 })
  estimatedDays: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
