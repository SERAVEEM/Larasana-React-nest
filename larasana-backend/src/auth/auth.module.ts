import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';

import { User } from '../users/entities/user.entity';
import { RefreshToken } from '../users/entities/refresh-token.entity';
import { EmailVerification } from '../users/entities/email-verification.entity';
import { PasswordReset } from '../users/entities/password-reset.entity';

import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    ConfigModule,

    PassportModule,

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '7d',
        },
      }),
    }),

    TypeOrmModule.forFeature([
      User,
      RefreshToken,
      EmailVerification,
      PasswordReset,
    ]),

    MailModule,
  ],

  controllers: [AuthController],

  providers: [
    AuthService,
    JwtStrategy,
    JwtRefreshStrategy,
  ],

  exports: [AuthService],
})
export class AuthModule {}