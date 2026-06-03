import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional, ValidateNested, IsArray, IsInt, Min } from 'class-validator';
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
    description: 'Metode Pembayaran (e.g. gopay, bank_transfer, dll)',
    example: 'gopay',
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
}
