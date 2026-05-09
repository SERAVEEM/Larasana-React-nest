import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { RefreshToken } from '../users/entities/refresh-token.entity';
import { EmailVerification } from '../users/entities/email-verification.entity';
import { PasswordReset } from '../users/entities/password-reset.entity';
import { Product } from '../products/entities/product.entity';
import { ProductImage } from '../products/entities/product-image.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Favorite } from '../favorites/entities/favorite.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 3306),
      username: process.env.DB_USERNAME ?? 'root',
      password: process.env.DB_PASSWORD ?? '',
      database: process.env.DB_NAME ?? 'larasana_db',
      entities: [
        User,
        RefreshToken,
        EmailVerification,
        PasswordReset,
        Product,
        ProductImage,
        Order,
        OrderItem,
        Favorite,
      ],
      synchronize: false,
      logging: process.env.NODE_ENV === 'development',
      timezone: '+07:00',
    }),
  ],
})
export class DatabaseModule {}

