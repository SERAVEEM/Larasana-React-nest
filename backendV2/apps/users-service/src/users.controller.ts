import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { USERS_PATTERNS } from '../../../libs/shared/src';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern(USERS_PATTERNS.FIND_BY_ID)
  findById(@Payload() data: { userId: number }) {
    return this.usersService.findById(data.userId);
  }

  @MessagePattern(USERS_PATTERNS.UPDATE_PROFILE)
  updateProfile(@Payload() data: { userId: number; name?: string; phone?: string; avatarUrl?: string }) {
    return this.usersService.updateProfile(data.userId, data);
  }
}
