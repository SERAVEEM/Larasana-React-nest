import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, Matches } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'Nama lengkap user',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Nomor HP user',
    example: '081234567890',
  })
  @IsOptional()
  @IsString()
  @Matches(/^(\+62|62|0)8[1-9][0-9]{6,10}$/, { message: 'Format nomor HP tidak valid' })
  phone?: string;

  @ApiPropertyOptional({
    description: 'URL foto profil/avatar',
    example: 'http://example.com/avatar.jpg',
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
