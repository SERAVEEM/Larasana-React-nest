import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, MaxLength, MinLength, Matches } from 'class-validator';

export class CreateAddressDto {
  @ApiPropertyOptional({ example: 'Rumah', description: 'Label alamat: Rumah, Kantor, dll' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  label?: string;

  @ApiProperty({ example: 'Alvin Choy', description: 'Nama penerima' })
  @IsString()
  @MaxLength(100)
  recipientName: string;

  @ApiProperty({ example: '081234567890', description: 'Nomor HP penerima' })
  @IsString()
  @Matches(/^(\+62|62|0)8[1-9][0-9]{6,10}$/, { message: 'Format nomor HP tidak valid' })
  phone: string;

  @ApiProperty({ example: 'Jalan Sandang No 068, RT 1/RW II', description: 'Alamat lengkap' })
  @IsString()
  @MinLength(10)
  fullAddress: string;

  @ApiProperty({ example: 'Palmerah', description: 'Kecamatan' })
  @IsString()
  @MaxLength(100)
  district: string;

  @ApiProperty({ example: 'Jakarta Barat', description: 'Kota/Kabupaten' })
  @IsString()
  @MaxLength(100)
  city: string;

  @ApiProperty({ example: 'DKI Jakarta', description: 'Provinsi' })
  @IsString()
  @MaxLength(100)
  province: string;

  @ApiProperty({ example: '11480', description: 'Kode Pos' })
  @IsString()
  @MaxLength(10)
  postalCode: string;

  @ApiPropertyOptional({ example: false, description: 'Set sebagai alamat utama' })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

export class UpdateAddressDto {
  @ApiPropertyOptional({ example: 'Rumah', description: 'Label alamat: Rumah, Kantor, dll' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  label?: string;

  @ApiPropertyOptional({ example: 'Alvin Choy', description: 'Nama penerima' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  recipientName?: string;

  @ApiPropertyOptional({ example: '081234567890', description: 'Nomor HP penerima' })
  @IsOptional()
  @IsString()
  @Matches(/^(\+62|62|0)8[1-9][0-9]{6,10}$/, { message: 'Format nomor HP tidak valid' })
  phone?: string;

  @ApiPropertyOptional({ example: 'Jalan Sandang No 068, RT 1/RW II', description: 'Alamat lengkap' })
  @IsOptional()
  @IsString()
  @MinLength(10)
  fullAddress?: string;

  @ApiPropertyOptional({ example: 'Palmerah', description: 'Kecamatan' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  district?: string;

  @ApiPropertyOptional({ example: 'Jakarta Barat', description: 'Kota/Kabupaten' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ example: 'DKI Jakarta', description: 'Provinsi' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  province?: string;

  @ApiPropertyOptional({ example: '11480', description: 'Kode Pos' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  postalCode?: string;

  @ApiPropertyOptional({ example: false, description: 'Set sebagai alamat utama' })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
