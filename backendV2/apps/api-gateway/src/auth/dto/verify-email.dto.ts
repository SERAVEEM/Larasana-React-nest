import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({
    description: 'Kode OTP 6 digit yang dikirim ke email',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'Kode OTP harus berupa 6 digit karakter' })
  token: string;
}
