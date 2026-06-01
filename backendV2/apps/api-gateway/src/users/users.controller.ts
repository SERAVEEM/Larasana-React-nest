import { Controller, Get, Patch, Body, UseGuards, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SERVICES, USERS_PATTERNS } from '../../../../libs/shared/src';
import { JwtAuthGuard } from '../common/guards';
import { GetUser } from '../common/get-user.decorator';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class UsersGatewayController {
  constructor(@Inject(SERVICES.USERS) private client: ClientProxy) {}

  @Get('me')
  @ApiOperation({ summary: 'Ambil profil user login' })
  getMe(@GetUser() user: any) {
    return this.client.send(USERS_PATTERNS.FIND_BY_ID, { userId: user.sub });
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update nama, HP, atau avatar' })
  updateMe(@GetUser() user: any, @Body() body: any) {
    return this.client.send(USERS_PATTERNS.UPDATE_PROFILE, { userId: user.sub, ...body });
  }
}
