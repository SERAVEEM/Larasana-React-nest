import { Controller, Get, Patch, Body, UseGuards, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { retry } from 'rxjs/operators';
import { SERVICES, USERS_PATTERNS } from '../../../../libs/shared/src';
import { JwtAuthGuard } from '../common/guards';
import { GetUser } from '../common/get-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from '../../../../libs/shared/src/entities/user.entity';
import { UnauthorizedResponseDto } from '../common/dto/error-response.dto';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class UsersGatewayController {
  constructor(@Inject(SERVICES.USERS) private client: ClientProxy) {}

  @Get('me')
  @ApiOperation({ summary: 'Ambil profil user login' })
  @ApiOkResponse({ type: User, description: 'Berhasil mengambil profil' })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponseDto })
  getMe(@GetUser() user: any) {
    return this.client.send(USERS_PATTERNS.FIND_BY_ID, { userId: user.sub }).pipe(retry({ count: 2, delay: 300 }));
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update nama, HP, atau avatar' })
  @ApiOkResponse({ type: User, description: 'Profil berhasil diupdate' })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponseDto })
  updateMe(@GetUser() user: any, @Body() body: UpdateProfileDto) {
    return this.client.send(USERS_PATTERNS.UPDATE_PROFILE, { userId: user.sub, ...body });
  }
}
