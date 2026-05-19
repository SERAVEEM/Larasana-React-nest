import {
  Injectable, NotFoundException, ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { FavoriteQueryDto } from './dto/favorite-query.dto';

export interface PaginatedFavorites {
  data: Favorite[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepo: Repository<Favorite>,
  ) {}

  // ── GET MY FAVORITES ───────────────────────────────────────
  // Halaman "Favorite" di dashboard — support search nama produk
  async getMyFavorites(userId: number, query: FavoriteQueryDto): Promise<PaginatedFavorites> {
    const { search, page = 1, limit = 12 } = query;
    const skip = (page - 1) * limit;

    const qb = this.favoriteRepo
      .createQueryBuilder('fav')
      .leftJoinAndSelect('fav.product', 'product')
      .leftJoinAndSelect('product.images', 'images')
      .where('fav.user_id = :userId', { userId })
      .andWhere('product.is_active = 1');

    if (search) {
      qb.andWhere('product.name LIKE :search', { search: `%${search}%` });
    }

    qb.orderBy('fav.created_at', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ── ADD TO FAVORITE ────────────────────────────────────────
  async addFavorite(userId: number, productId: number): Promise<Favorite> {
    // Cek sudah ada
    const existing = await this.favoriteRepo.findOne({
      where: { userId, productId },
    });

    if (existing) throw new ConflictException('Produk sudah ada di daftar favorit');

    const favorite = this.favoriteRepo.create({ userId, productId });
    return this.favoriteRepo.save(favorite);
  }

  // ── REMOVE FROM FAVORITE ───────────────────────────────────
  async removeFavorite(userId: number, productId: number): Promise<void> {
    const favorite = await this.favoriteRepo.findOne({
      where: { userId, productId },
    });

    if (!favorite) throw new NotFoundException('Produk tidak ada di daftar favorit');

    await this.favoriteRepo.remove(favorite);
  }

  // ── CHECK IS FAVORITED ─────────────────────────────────────
  // Dipakai frontend untuk tampilkan icon hati merah/kosong
  async isFavorited(userId: number, productId: number): Promise<boolean> {
    const count = await this.favoriteRepo.count({ where: { userId, productId } });
    return count > 0;
  }
}
