import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FavoritesService } from './favorites.service';
import { FAVORITES_PATTERNS } from '../../../libs/shared/src';

@Controller()
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @MessagePattern(FAVORITES_PATTERNS.GET_MY)
  getMyFavorites(@Payload() data: { userId: number; search?: string; page?: number; limit?: number }) {
    return this.favoritesService.getMyFavorites(data);
  }

  @MessagePattern(FAVORITES_PATTERNS.ADD)
  add(@Payload() data: { userId: number; productId: number }) {
    return this.favoritesService.addFavorite(data.userId, data.productId);
  }

  @MessagePattern(FAVORITES_PATTERNS.REMOVE)
  remove(@Payload() data: { userId: number; productId: number }) {
    return this.favoritesService.removeFavorite(data.userId, data.productId);
  }

  @MessagePattern(FAVORITES_PATTERNS.CHECK)
  check(@Payload() data: { userId: number; productId: number }) {
    return this.favoritesService.isFavorited(data.userId, data.productId);
  }
}
