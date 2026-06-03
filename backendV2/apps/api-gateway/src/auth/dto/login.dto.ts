import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Email terdaftar',
    example: 'admin@larasana.id',
  })
  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Kata sandi akun',
    example: 'admin123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
