import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createDatabaseModule, Favorite, Product, ProductImage, User } from '../../../libs/shared/src';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';

@Module({
  imports: [
    createDatabaseModule([Favorite, Product, ProductImage, User]),
    TypeOrmModule.forFeature([Favorite, Product, ProductImage, User]),
  ],
  controllers: [FavoritesController],
  providers: [FavoritesService],
})
export class FavoritesAppModule {}
