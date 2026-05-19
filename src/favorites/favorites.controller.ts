import {
  Controller, Get, Post, Delete, Query, Param,
  UseGuards, ParseIntPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { FavoriteQueryDto } from './dto/favorite-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@ApiTags('favorites')
@Controller('favorites')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  // GET /api/v1/favorites
  // Halaman Favorite — support search nama produk
  @Get()
  @ApiOperation({
    summary: 'Ambil daftar produk favorit user',
    description: 'Support search: ?search=sarung. Paginated 12 item/halaman',
  })
  getMyFavorites(
    @GetUser('id') userId: number,
    @Query() query: FavoriteQueryDto,
  ) {
    return this.favoritesService.getMyFavorites(userId, query);
  }

  // POST /api/v1/favorites/:productId
  // Klik icon hati → tambah ke favorit
  @Post(':productId')
  @ApiOperation({ summary: 'Tambah produk ke favorit (klik icon hati)' })
  @ApiParam({ name: 'productId', description: 'ID produk yang difavoritkan' })
  addFavorite(
    @GetUser('id') userId: number,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.favoritesService.addFavorite(userId, productId);
  }

  // DELETE /api/v1/favorites/:productId
  // Klik icon hati lagi → hapus dari favorit
  @Delete(':productId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hapus produk dari favorit (klik icon hati merah)' })
  @ApiParam({ name: 'productId', description: 'ID produk yang dihapus dari favorit' })
  async removeFavorite(
    @GetUser('id') userId: number,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    await this.favoritesService.removeFavorite(userId, productId);
    return { message: 'Produk dihapus dari favorit' };
  }

  // GET /api/v1/favorites/check/:productId
  // Cek apakah produk sudah difavoritkan (untuk tampilkan icon hati)
  @Get('check/:productId')
  @ApiOperation({ summary: 'Cek apakah produk sudah ada di favorit' })
  @ApiParam({ name: 'productId' })
  async checkFavorite(
    @GetUser('id') userId: number,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    const isFavorited = await this.favoritesService.isFavorited(userId, productId);
    return { isFavorited };
  }
}
