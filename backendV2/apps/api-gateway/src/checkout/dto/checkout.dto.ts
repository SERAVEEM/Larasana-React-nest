import { ApiProperty } from '@nestjs/swagger';
import {
  IsString, IsNotEmpty, IsNumber, IsOptional,
  ValidateNested, IsArray, IsInt, Min, Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CheckoutItemDto {
  @ApiProperty({
    description: 'ID Produk yang dibeli',
    example: 1,
  })
  @IsInt()
  @Min(1)
  productId: number;

  @ApiProperty({
    description: 'Jumlah kuantitas pembelian',
    example: 2,
  })
  @IsInt()
  @Min(1)
  @Max(100, { message: 'Kuantitas maksimal 100 item per produk' })
  quantity: number;
}

export class CheckoutDto {
  @ApiProperty({
    description: 'Daftar item belanja',
    type: [CheckoutItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  items: CheckoutItemDto[];

  @ApiProperty({
    description: 'ID Alamat Pengiriman',
    example: 1,
  })
  @IsInt()
  @Min(1)
  addressId: number;

  @ApiProperty({
    description: 'ID Metode Pengiriman',
    example: 1,
  })
  @IsInt()
  @Min(1)
  shippingMethodId: number;

  @ApiProperty({
    description: 'Metode Pembayaran (qris | bank_transfer | va_bca | va_bni | va_bri | va_mandiri | gopay | shopeepay | credit_card)',
    example: 'qris',
  })
  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  @ApiProperty({
    description: 'Catatan tambahan untuk pesanan',
    example: 'Kirim setelah jam 5 sore',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;

  // NOTE: weight is accepted from the client as a hint but the backend
  // will ALWAYS re-derive the authoritative weight from product.weightGrams.
  // This field is kept for legacy compatibility only and has strict bounds.
  @ApiProperty({
    description: 'Total berat paket dalam gram (hint saja — backend akan re-kalkulasi dari DB)',
    example: 1000,
    required: false,
  })
  @IsInt()
  @Min(50, { message: 'Berat minimal 50 gram' })
  @Max(50000, { message: 'Berat maksimal 50.000 gram (50 kg)' })
  @IsOptional()
  weight?: number;

  // usdRate has been REMOVED from this DTO intentionally.
  // The exchange rate is owned exclusively by the server (env: RAJAONGKIR_USD_RATE).
  // Accepting it from the client would allow price manipulation (FLAW-04 / FLAW-07).
}
