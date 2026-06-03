import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min } from 'class-validator';

export class ProductsQueryDto {
  @ApiPropertyOptional({
    description: 'Pencarian nama produk',
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
    example: 20,
    default: 20,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;
}
