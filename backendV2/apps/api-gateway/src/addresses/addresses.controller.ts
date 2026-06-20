import { Controller, Get, Post, Put, Patch, Delete, Param, Body, UseGuards, Inject, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiOkResponse, ApiCreatedResponse, ApiUnauthorizedResponse, ApiNotFoundResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { retry } from 'rxjs/operators';
import { SERVICES, ADDRESSES_PATTERNS } from '../../../../libs/shared/src';
import { JwtAuthGuard } from '../common/guards';
import { GetUser } from '../common/get-user.decorator';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';
import { Address } from '../../../../libs/shared/src/entities/address.entity';
import { MessageResponseDto } from '../auth/dto/auth-response.dto';
import { BadRequestResponseDto, UnauthorizedResponseDto, NotFoundResponseDto } from '../common/dto/error-response.dto';

@ApiTags('addresses')
@Controller('addresses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class AddressesGatewayController {
  constructor(@Inject(SERVICES.ADDRESSES) private client: ClientProxy) {}

  @Get()
  @ApiOperation({ summary: 'Semua alamat (primary di atas)' })
  @ApiOkResponse({ type: [Address], description: 'Daftar alamat user berhasil diambil' })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponseDto })
  getAll(@GetUser() user: any) {
    return this.client.send(ADDRESSES_PATTERNS.GET_MY, { userId: user.sub }).pipe(retry({ count: 2, delay: 300 }));
  }

  @Post()
  @ApiOperation({ summary: 'Tambah alamat baru' })
  @ApiCreatedResponse({ type: Address, description: 'Alamat berhasil ditambahkan' })
  @ApiBadRequestResponse({ type: BadRequestResponseDto })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponseDto })
  create(@GetUser() user: any, @Body() body: CreateAddressDto) {
    return this.client.send(ADDRESSES_PATTERNS.CREATE, { userId: user.sub, ...body });
  }

  @Put(':id')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Update alamat' })
  @ApiOkResponse({ type: Address, description: 'Alamat berhasil diperbarui' })
  @ApiBadRequestResponse({ type: BadRequestResponseDto })
  @ApiNotFoundResponse({ type: NotFoundResponseDto, description: 'Alamat tidak ditemukan' })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponseDto })
  update(@GetUser() user: any, @Param('id', ParseIntPipe) id: number, @Body() body: UpdateAddressDto) {
    return this.client.send(ADDRESSES_PATTERNS.UPDATE, { userId: user.sub, addressId: id, ...body });
  }

  @Patch(':id/primary')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Set sebagai alamat utama' })
  @ApiOkResponse({ type: MessageResponseDto, description: 'Berhasil mengatur alamat utama' })
  @ApiNotFoundResponse({ type: NotFoundResponseDto })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponseDto })
  setPrimary(@GetUser() user: any, @Param('id', ParseIntPipe) id: number) {
    return this.client.send(ADDRESSES_PATTERNS.SET_PRIMARY, { userId: user.sub, addressId: id });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Hapus alamat' })
  @ApiOkResponse({ type: MessageResponseDto, description: 'Alamat berhasil dihapus' })
  @ApiNotFoundResponse({ type: NotFoundResponseDto })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponseDto })
  delete(@GetUser() user: any, @Param('id', ParseIntPipe) id: number) {
    return this.client.send(ADDRESSES_PATTERNS.DELETE, { userId: user.sub, addressId: id });
  }
}
