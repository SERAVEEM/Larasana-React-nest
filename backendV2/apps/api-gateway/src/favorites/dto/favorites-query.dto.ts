import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min } from 'class-validator';

export class FavoritesQueryDto {
  @ApiPropertyOptional({
    description: 'Pencarian nama produk terfavorit',
    example: 'Noir',
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
    example: 12,
    default: 12,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;
}
