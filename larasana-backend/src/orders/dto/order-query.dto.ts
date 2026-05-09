import { IsOptional, IsIn, IsString, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class OrderQueryDto {
  @ApiPropertyOptional({
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    description: 'Filter berdasarkan status order',
  })
  @IsOptional()
  @IsIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
  status?: string;

  @ApiPropertyOptional({ description: 'Cari berdasarkan kode order atau nama produk' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}
