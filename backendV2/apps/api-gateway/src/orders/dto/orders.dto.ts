import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min } from 'class-validator';

export class OrdersQueryDto {
  @ApiPropertyOptional({
    description: 'Filter status pesanan (pending, processing, shipping, completed, cancelled)',
    example: 'pending',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Pencarian kode pesanan',
    example: 'LRS-',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Halaman data',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Jumlah data per halaman',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;
}

export class CancelOrderDto {
  @ApiPropertyOptional({
    description: 'Alasan pembatalan pesanan',
    example: 'Ingin mengubah metode pembayaran',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
