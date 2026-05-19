import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, ParseIntPipe, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AddressesService } from './addresses.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@ApiTags('addresses')
@Controller('addresses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  // GET /api/v1/addresses
  @Get()
  @ApiOperation({ summary: 'Ambil semua alamat milik user (primary di atas)' })
  getMyAddresses(@GetUser('id') userId: number) {
    return this.addressesService.getMyAddresses(userId);
  }

  // POST /api/v1/addresses
  @Post()
  @ApiOperation({ summary: 'Tambah alamat baru' })
  createAddress(
    @GetUser('id') userId: number,
    @Body() dto: CreateAddressDto,
  ) {
    return this.addressesService.createAddress(userId, dto);
  }

  // PUT /api/v1/addresses/:id
  @Put(':id')
  @ApiOperation({ summary: 'Update alamat' })
  @ApiParam({ name: 'id' })
  updateAddress(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) addressId: number,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.addressesService.updateAddress(userId, addressId, dto);
  }

  // PATCH /api/v1/addresses/:id/primary
  @Patch(':id/primary')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set alamat sebagai alamat utama' })
  @ApiParam({ name: 'id' })
  setPrimary(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) addressId: number,
  ) {
    return this.addressesService.setPrimary(userId, addressId);
  }

  // DELETE /api/v1/addresses/:id
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hapus alamat (tidak bisa hapus alamat utama)' })
  @ApiParam({ name: 'id' })
  async deleteAddress(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) addressId: number,
  ) {
    await this.addressesService.deleteAddress(userId, addressId);
    return { message: 'Alamat berhasil dihapus' };
  }
}
