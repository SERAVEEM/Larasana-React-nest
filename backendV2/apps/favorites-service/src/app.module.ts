import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createDatabaseModule, Favorite, Product } from '../../../libs/shared/src';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';

@Module({
  imports: [
    createDatabaseModule([Favorite, Product]),
    TypeOrmModule.forFeature([Favorite, Product]),
  ],
  controllers: [FavoritesController],
  providers: [FavoritesService],
})
export class FavoritesAppModule {}
