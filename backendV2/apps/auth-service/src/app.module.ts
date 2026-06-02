import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  createDatabaseModule,
  User, RefreshToken, EmailVerification, PasswordReset,
  SERVICES,
} from '../../../libs/shared/src';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    createDatabaseModule([User, RefreshToken, EmailVerification, PasswordReset]),
    TypeOrmModule.forFeature([User, RefreshToken, EmailVerification, PasswordReset]),
    JwtModule.register({}),
    // Auth service perlu kirim notifikasi OTP ke notification service
    ClientsModule.register([
      {
        name: SERVICES.NOTIFICATION,
        transport: Transport.TCP,
        options: { host: '127.0.0.1', port: Number(process.env.NOTIFICATION_SERVICE_PORT ?? 3007) },
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthAppModule {}
