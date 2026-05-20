import { IsEnum, IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// Query untuk list user
export class AdminUserQueryDto {
  @ApiPropertyOptional({ enum: ['buyer', 'seller', 'admin'] })
  @IsOptional()
  @IsEnum(['buyer', 'seller', 'admin'])
  role?: string;

  @ApiPropertyOptional({ description: 'Cari nama atau email' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

// Query untuk list seller yang apply
export class AdminSellerQueryDto {
  @ApiPropertyOptional({ enum: ['pending', 'approved', 'rejected'] })
  @IsOptional()
  @IsEnum(['pending', 'approved', 'rejected'])
  status?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

// Approve / reject seller
export class ReviewSellerDto {
  @ApiProperty({ enum: ['approved', 'rejected'] })
  @IsEnum(['approved', 'rejected'])
  decision: 'approved' | 'rejected';

  @ApiPropertyOptional({ description: 'Wajib diisi kalau reject' })
  @IsOptional()
  @IsString()
  reason?: string;
}

// Query untuk list semua order
export class AdminOrderQueryDto {
  @ApiPropertyOptional({ enum: ['pending','processing','shipped','delivered','cancelled'] })
  @IsOptional()
  @IsEnum(['pending','processing','shipped','delivered','cancelled'])
  status?: string;

  @ApiPropertyOptional({ description: 'Cari kode order' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

// Update status order (admin bisa manual update)
export class AdminUpdateOrderStatusDto {
  @ApiProperty({ enum: ['pending','processing','shipped','delivered','cancelled'] })
  @IsEnum(['pending','processing','shipped','delivered','cancelled'])
  status: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}

// Nonaktifkan / aktifkan user
export class AdminToggleUserDto {
  @ApiProperty({ example: false, description: 'true = aktif, false = nonaktif' })
  isActive: boolean;
}
