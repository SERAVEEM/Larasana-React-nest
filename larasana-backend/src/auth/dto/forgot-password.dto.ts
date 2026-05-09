import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'siti@gmail.com' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  email: string;
}
