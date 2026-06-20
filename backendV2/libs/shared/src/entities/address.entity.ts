import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';

@Entity('addresses')
export class Address {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @ApiProperty({ example: 1 })
  @Index('idx_addresses_user_id')
  @Column({ name: 'user_id', unsigned: true })
  userId: number;


  @ApiProperty({ example: 'Rumah' })
  @Column({ length: 50, default: 'Rumah' })
  label: string;

  @ApiProperty({ example: 'John Doe' })
  @Column({ name: 'recipient_name', length: 100 })
  recipientName: string;

  @ApiProperty({ example: '08123456789' })
  @Column({ length: 20 })
  phone: string;

  @ApiProperty({ example: 'Jl. Raya Lombok No. 123' })
  @Column({ name: 'full_address', type: 'text' })
  fullAddress: string;

  @ApiProperty({ example: 'Senggigi' })
  @Column({ length: 100 })
  district: string;

  @ApiProperty({ example: 'Lombok Barat' })
  @Column({ length: 100 })
  city: string;

  @ApiProperty({ example: 'Nusa Tenggara Barat' })
  @Column({ length: 100 })
  province: string;

  @ApiProperty({ example: '83355' })
  @Column({ name: 'postal_code', length: 10 })
  postalCode: string;

  @ApiProperty({ example: 'ID' })
  @Column({ length: 10, default: 'ID' })
  country: string;

  @ApiProperty({ default: false })
  @Column({ name: 'is_primary', default: false })
  isPrimary: boolean;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
