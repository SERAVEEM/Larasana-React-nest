import { Controller, Get, Post, Delete, Param, Query, UseGuards, Inject, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { SERVICES, FAVORITES_PATTERNS } from '../../../../libs/shared/src';
import { JwtAuthGuard } from '../common/guards';
import { GetUser } from '../common/get-user.decorator';

@ApiTags('favorites')
@Controller('favorites')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class FavoritesGatewayController {
  constructor(@Inject(SERVICES.FAVORITES) private client: ClientProxy) {}

  @Get()
  @ApiOperation({ summary: 'Daftar favorit — bisa search' })
  getMyFavorites(@GetUser() user: any, @Query() query: any) {
    return this.client.send(FAVORITES_PATTERNS.GET_MY, { userId: user.sub, ...query });
  }

  @Post(':productId')
  @ApiParam({ name: 'productId' })
  @ApiOperation({ summary: 'Tambah ke favorit' })
  add(@GetUser() user: any, @Param('productId', ParseIntPipe) productId: number) {
    return this.client.send(FAVORITES_PATTERNS.ADD, { userId: user.sub, productId });
  }

  @Delete(':productId')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'productId' })
  @ApiOperation({ summary: 'Hapus dari favorit' })
  remove(@GetUser() user: any, @Param('productId', ParseIntPipe) productId: number) {
    return this.client.send(FAVORITES_PATTERNS.REMOVE, { userId: user.sub, productId });
  }

  @Get('check/:productId')
  @ApiParam({ name: 'productId' })
  @ApiOperation({ summary: 'Cek sudah difavoritkan?' })
  check(@GetUser() user: any, @Param('productId', ParseIntPipe) productId: number) {
    return this.client.send(FAVORITES_PATTERNS.CHECK, { userId: user.sub, productId });
  }
}
