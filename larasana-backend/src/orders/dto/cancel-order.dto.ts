import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CancelOrderDto {
  @ApiPropertyOptional({ example: 'Ingin ganti warna', description: 'Alasan pembatalan' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
