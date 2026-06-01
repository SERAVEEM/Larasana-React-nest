import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from '../../../libs/shared/src';

@Injectable()
export class FavoritesService {
  constructor(@InjectRepository(Favorite) private favoriteRepo: Repository<Favorite>) {}

  async getMyFavorites(query: { userId: number; search?: string; page?: number; limit?: number }) {
    const { userId, search, page = 1, limit = 12 } = query;
    const skip = (page - 1) * limit;

    const qb = this.favoriteRepo
      .createQueryBuilder('fav')
      .leftJoinAndSelect('fav.product', 'product')
      .leftJoinAndSelect('product.images', 'images')
      .where('fav.user_id = :userId', { userId })
      .andWhere('product.is_active = 1');

    if (search) qb.andWhere('product.name LIKE :search', { search: `%${search}%` });

    qb.orderBy('fav.created_at', 'DESC').skip(skip).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async addFavorite(userId: number, productId: number) {
    const existing = await this.favoriteRepo.findOne({ where: { userId, productId } });
    if (existing) throw new ConflictException('Produk sudah ada di favorit');
    return this.favoriteRepo.save(this.favoriteRepo.create({ userId, productId }));
  }

  async removeFavorite(userId: number, productId: number) {
    const fav = await this.favoriteRepo.findOne({ where: { userId, productId } });
    if (!fav) throw new NotFoundException('Produk tidak ada di favorit');
    await this.favoriteRepo.remove(fav);
    return { message: 'Dihapus dari favorit' };
  }

  async isFavorited(userId: number, productId: number) {
    const count = await this.favoriteRepo.count({ where: { userId, productId } });
    return { isFavorited: count > 0 };
  }
}
