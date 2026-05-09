import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty({ example: '482910', description: 'Kode OTP 6 digit yang dikirim ke email' })
  @IsString()
  @Length(6, 6, { message: 'Token harus 6 digit' })
  token: string;
}
