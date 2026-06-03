import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, DeleteDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export type UserRole = 'buyer' | 'seller' | 'admin';

@Entity('users')
export class User {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @ApiProperty({ example: 'John Doe' })
  @Column({ length: 100 })
  name: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @Column({ length: 150, unique: true })
  email: string;

  // select: false → tidak ikut di SELECT biasa, harus eksplisit addSelect
  @Column({ name: 'password_hash', length: 255, select: false })
  passwordHash: string;

  @ApiProperty({ enum: ['buyer', 'seller', 'admin'], default: 'buyer' })
  @Column({ type: 'enum', enum: ['buyer', 'seller', 'admin'], default: 'buyer' })
  role: UserRole;

  @ApiProperty({ default: false })
  @Column({ name: 'is_email_verified', default: false })
  isEmailVerified: boolean;

  @ApiProperty({ default: true })
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', nullable: true })
  @Column({ name: 'avatar_url', length: 500, nullable: true })
  avatarUrl: string | null;

  @ApiProperty({ example: '08123456789', nullable: true })
  @Column({ length: 20, nullable: true })
  phone: string | null;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
  emailVerifications: any;
  passwordResets: any;
  refreshTokens: any;
}
