import { ApiProperty } from '@nestjs/swagger';

export class BadRequestResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({
    type: [String],
    example: ['email must be an email', 'password must be longer than or equal to 6 characters']
  })
  message: string[];

  @ApiProperty({ example: 'Bad Request' })
  error: string;
}

export class UnauthorizedResponseDto {
  @ApiProperty({ example: 401 })
  statusCode: number;

  @ApiProperty({ example: 'Email atau password salah' })
  message: string;

  @ApiProperty({ example: 'Unauthorized' })
  error: string;
}

export class ForbiddenResponseDto {
  @ApiProperty({ example: 403 })
  statusCode: number;

  @ApiProperty({ example: 'Forbidden resource' })
  message: string;

  @ApiProperty({ example: 'Forbidden' })
  error: string;
}

export class NotFoundResponseDto {
  @ApiProperty({ example: 404 })
  statusCode: number;

  @ApiProperty({ example: 'Entitas tidak ditemukan' })
  message: string;

  @ApiProperty({ example: 'Not Found' })
  error: string;
}

export class ConflictResponseDto {
  @ApiProperty({ example: 409 })
  statusCode: number;

  @ApiProperty({ example: 'Email sudah terdaftar' })
  message: string;

  @ApiProperty({ example: 'Conflict' })
  error: string;
}
