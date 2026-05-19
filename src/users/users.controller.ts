import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET /api/v1/users/me
  // Dipakai navbar: ambil name, avatarUrl, role
  @Get('me')
  @ApiOperation({
    summary: 'Ambil profil user login',
    description: 'Return name, email, avatarUrl, role — dipakai navbar kanan atas',
  })
  getMe(@GetUser() user: User): User {
    return user;
  }

  // PATCH /api/v1/users/me
  // Update nama, phone, avatar
  @Patch('me')
  @ApiOperation({ summary: 'Update nama, nomor HP, atau avatar' })
  updateMe(
    @GetUser('id') userId: number,
    @Body() dto: UpdateProfileDto,
  ): Promise<User> {
    return this.usersService.updateProfile(userId, dto);
  }
}

