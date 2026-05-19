import { IsInt, IsEnum, IsOptional, IsString, IsArray, ValidateNested, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CheckoutItemDto {
  @ApiProperty({ example: 1, description: 'ID produk' })
  @IsInt()
  productId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CheckoutDto {
  @ApiProperty({ type: [CheckoutItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  items: CheckoutItemDto[];

  @ApiProperty({ example: 1, description: 'ID alamat pengiriman' })
  @IsInt()
  addressId: number;

  @ApiProperty({ example: 2, description: 'ID metode pengiriman' })
  @IsInt()
  shippingMethodId: number;

  @ApiProperty({
    enum: ['qris','bank_transfer','va_bca','va_bni','va_bri','va_mandiri','gopay','shopeepay'],
    example: 'qris',
  })
  @IsEnum(['qris','bank_transfer','va_bca','va_bni','va_bri','va_mandiri','gopay','shopeepay'])
  paymentMethod: string;

  @ApiPropertyOptional({ example: 'Tolong dibungkus rapi' })
  @IsOptional()
  @IsString()
  notes?: string;
}
