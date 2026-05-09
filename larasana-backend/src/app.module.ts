import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/product.module';
import { OrdersModule } from './orders/orders.module';
import { FavoritesModule } from './favorites/favorite.module';
import { MailModule } from './mail/mail.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    DatabaseModule,
    MailModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    OrdersModule,
    FavoritesModule,
  ],
})
export class AppModule {}

