import {
  IsString, IsOptional, IsBoolean,
  MaxLength, MinLength, Matches, IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const ALLOWED_COUNTRIES = [
  'ID',
  'US', 'GB', 'AU', 'SG', 'MY', 'JP', 'KR', 'DE', 'FR', 'NL',
  'CN', 'HK', 'TW', 'TH', 'PH', 'VN', 'IN', 'SA', 'AE', 'CA',
] as const;

export class CreateAddressDto {
  @ApiPropertyOptional({ example: 'Rumah', description: 'Label alamat: Rumah, Kantor, dll' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  label?: string;

  @ApiProperty({ example: 'Alvin Choy' })
  @IsString()
  @MaxLength(100)
  recipientName: string;

  @ApiProperty({ example: '081234567890' })
  @IsString()
  @Matches(/^(\+62|62|0)8[1-9][0-9]{6,10}$/, { message: 'Format nomor HP tidak valid' })
  phone: string;

  @ApiProperty({ example: 'Jalan Sandang No 068, RT 1/RW II' })
  @IsString()
  @MinLength(10)
  fullAddress: string;

  @ApiProperty({ example: 'Palmerah' })
  @IsString()
  @MaxLength(100)
  district: string;

  @ApiProperty({ example: 'Jakarta Barat' })
  @IsString()
  @MaxLength(100)
  city: string;

  @ApiProperty({ example: 'DKI Jakarta' })
  @IsString()
  @MaxLength(100)
  province: string;

  @ApiProperty({ example: '11480' })
  @IsString()
  @MaxLength(10)
  postalCode: string;

  @ApiPropertyOptional({ example: 'ID' })
  @IsOptional()
  @IsString()
  @IsIn([...ALLOWED_COUNTRIES], { message: 'Kode negara tidak didukung' })
  country?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

export class UpdateAddressDto extends CreateAddressDto {}
