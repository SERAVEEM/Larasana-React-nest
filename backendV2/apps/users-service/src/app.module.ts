import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createDatabaseModule, User } from '../../../libs/shared/src';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    createDatabaseModule([User]),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersAppModule {}
