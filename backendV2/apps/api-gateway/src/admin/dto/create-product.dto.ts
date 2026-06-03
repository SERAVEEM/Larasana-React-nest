import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, Min, IsOptional, IsArray } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'Nama produk vest',
    example: 'Noir Enchanted Vest',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Deskripsi produk',
    example: 'Noir Enchanted Vest handwoven from Lombok tenun.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Harga produk dalam USD (US Dollars)',
    example: 120,
  })
  @IsNumber()
  @Min(0)
  numericPrice: number;

  @ApiPropertyOptional({
    description: 'Stok awal produk (opsional untuk pre-order)',
    example: 9999,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({
    description: 'Nama Penenun (Weaver)',
    example: 'Yulia Andirtia',
  })
  @IsOptional()
  @IsString()
  weaverName?: string;

  @ApiPropertyOptional({
    description: 'Biografi Penenun',
    example: 'Crafted by Yulia Andirtia from Lombok...',
  })
  @IsOptional()
  @IsString()
  weaverBio?: string;

  @ApiPropertyOptional({
    description: 'URL Foto Penenun',
    example: '/images/weaver/yulia.png',
  })
  @IsOptional()
  @IsString()
  weaverImageUrl?: string;

  @ApiPropertyOptional({
    description: 'Kode SKU produk',
    example: '#32A53',
  })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional({
    description: 'Daftar ukuran baju yang tersedia',
    example: ['S', 'M', 'L', 'XL'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sizes?: string[];

  @ApiPropertyOptional({
    description: 'URL QR Code untuk verifikasi keaslian tenun',
    example: '/images/product/authenticity_qr.png',
  })
  @IsOptional()
  @IsString()
  qrCode?: string;

  @ApiPropertyOptional({
    description: 'Jumlah penjualan awal',
    example: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sales?: number;

  @ApiPropertyOptional({
    description: 'Kategori produk',
    example: 'Authentic Handmade',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'URL gambar utama produk',
    example: '/images/product/far left.png',
  })
  @IsOptional()
  @IsString()
  image?: string;
}
