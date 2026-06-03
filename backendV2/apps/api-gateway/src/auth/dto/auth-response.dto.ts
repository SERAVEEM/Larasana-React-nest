import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../../../../libs/shared/src/entities/user.entity';

export class TokensDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken: string;
}

export class AuthResponseDto {
  @ApiProperty({ type: () => User })
  user: User;

  @ApiProperty({ type: TokensDto })
  tokens: TokensDto;
}

export class MessageResponseDto {
  @ApiProperty({ example: 'Operasi berhasil dilakukan' })
  message: string;
}
