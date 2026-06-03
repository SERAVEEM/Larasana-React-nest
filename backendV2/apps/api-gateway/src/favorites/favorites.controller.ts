import { Controller, Get, Post, Delete, Param, Query, UseGuards, Inject, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiOkResponse, ApiCreatedResponse, ApiUnauthorizedResponse, ApiConflictResponse } from '@nestjs/swagger';
import { SERVICES, FAVORITES_PATTERNS } from '../../../../libs/shared/src';
import { JwtAuthGuard } from '../common/guards';
import { GetUser } from '../common/get-user.decorator';
import { FavoritesQueryDto } from './dto/favorites-query.dto';
import { Favorite } from '../../../../libs/shared/src/entities/favorite.entity';
import { MessageResponseDto } from '../auth/dto/auth-response.dto';
import { UnauthorizedResponseDto, ConflictResponseDto } from '../common/dto/error-response.dto';

@ApiTags('favorites')
@Controller('favorites')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class FavoritesGatewayController {
  constructor(@Inject(SERVICES.FAVORITES) private client: ClientProxy) {}

  @Get()
  @ApiOperation({ summary: 'Daftar favorit — bisa search' })
  @ApiOkResponse({ type: [Favorite], description: 'Daftar produk favorit berhasil diambil' })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponseDto })
  getMyFavorites(@GetUser() user: any, @Query() query: FavoritesQueryDto) {
    return this.client.send(FAVORITES_PATTERNS.GET_MY, { userId: user.sub, ...query });
  }

  @Post(':productId')
  @ApiParam({ name: 'productId' })
  @ApiOperation({ summary: 'Tambah ke favorit' })
  @ApiCreatedResponse({ type: Favorite, description: 'Produk berhasil ditambahkan ke favorit' })
  @ApiConflictResponse({ type: ConflictResponseDto, description: 'Produk sudah ada di favorit' })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponseDto })
  add(@GetUser() user: any, @Param('productId', ParseIntPipe) productId: number) {
    return this.client.send(FAVORITES_PATTERNS.ADD, { userId: user.sub, productId });
  }

  @Delete(':productId')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'productId' })
  @ApiOperation({ summary: 'Hapus dari favorit' })
  @ApiOkResponse({ type: MessageResponseDto, description: 'Produk berhasil dihapus dari favorit' })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponseDto })
  remove(@GetUser() user: any, @Param('productId', ParseIntPipe) productId: number) {
    return this.client.send(FAVORITES_PATTERNS.REMOVE, { userId: user.sub, productId });
  }

  @Get('check/:productId')
  @ApiParam({ name: 'productId' })
  @ApiOperation({ summary: 'Cek sudah difavoritkan?' })
  @ApiOkResponse({ schema: { type: 'boolean', example: true }, description: 'Status favorit produk' })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponseDto })
  check(@GetUser() user: any, @Param('productId', ParseIntPipe) productId: number) {
    return this.client.send(FAVORITES_PATTERNS.CHECK, { userId: user.sub, productId });
  }
}
