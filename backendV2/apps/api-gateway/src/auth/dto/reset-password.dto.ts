import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Token reset password dari email',
    example: 'random_reset_token_string',
  })
  @IsString()
  @IsNotEmpty()
  resetToken: string;

  @ApiProperty({
    description: 'Kata sandi baru minimal 6 karakter',
    example: 'newpassword123',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password baru minimal 6 karakter' })
  newPassword: string;
}
