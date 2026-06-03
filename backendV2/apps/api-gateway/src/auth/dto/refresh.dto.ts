import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class RefreshDto {
  @ApiProperty({
    description: 'Refresh token aktif',
    example: 'refresh_token_string',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
