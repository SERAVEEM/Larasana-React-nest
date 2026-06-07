import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class GoogleLoginDto {
  @ApiProperty({
    description: 'Credential token dari Google (ID Token)',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjFkOWU4...',
  })
  @IsString()
  @IsNotEmpty()
  idToken: string;
}
