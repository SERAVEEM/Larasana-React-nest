import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavoritesService } from './favorite.service';
import { FavoritesController } from './favorite.controller';
import { Favorite } from './entities/favorite.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Favorite])],
  controllers: [FavoritesController],
  providers: [FavoritesService],
  exports: [FavoritesService],
})
export class FavoritesModule {}
