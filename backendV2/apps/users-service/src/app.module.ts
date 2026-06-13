import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  createDatabaseModule,
  User, RefreshToken, EmailVerification, PasswordReset, Order, OrderItem, Payment, Product, ProductImage, Favorite, Address, ShippingMethod,
  SERVICES,
} from '../../../libs/shared/src';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [
    createDatabaseModule([
      User, RefreshToken, EmailVerification, PasswordReset, Order, OrderItem, Payment, Product, ProductImage, Favorite, Address, ShippingMethod,
    ]),
    TypeOrmModule.forFeature([
      User, RefreshToken, EmailVerification, PasswordReset, Order, Payment, Product,
    ]),
    JwtModule.register({}),
    ClientsModule.register([
      {
        name: SERVICES.NOTIFICATION,
        transport: Transport.TCP,
        options: {
          host: process.env.NOTIFICATION_SERVICE_HOST ?? '127.0.0.1',
          port: Number(process.env.NOTIFICATION_SERVICE_PORT ?? 3003),
        },
      },
    ]),
  ],
  controllers: [UsersController, AuthController, AdminController],
  providers: [UsersService, AuthService, AdminService],
})
export class UsersAppModule {}
