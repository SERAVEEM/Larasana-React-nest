import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'Nama lengkap pendaftar',
    example: 'Alvin Cihuy',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Email unik pendaftar',
    example: 'alvin.cihuy@example.com',
  })
  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Kata sandi minimal 6 karakter',
    example: 'password123',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  password: string;
}
