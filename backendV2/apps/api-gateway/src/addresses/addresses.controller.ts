import { Controller, Get, Post, Put, Patch, Delete, Param, Body, UseGuards, Inject, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { SERVICES, ADDRESSES_PATTERNS } from '../../../../libs/shared/src';
import { JwtAuthGuard } from '../common/guards';
import { GetUser } from '../common/get-user.decorator';

@ApiTags('addresses')
@Controller('addresses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class AddressesGatewayController {
  constructor(@Inject(SERVICES.ADDRESSES) private client: ClientProxy) {}

  @Get()
  @ApiOperation({ summary: 'Semua alamat (primary di atas)' })
  getAll(@GetUser() user: any) {
    return this.client.send(ADDRESSES_PATTERNS.GET_MY, { userId: user.sub });
  }

  @Post()
  @ApiOperation({ summary: 'Tambah alamat baru' })
  create(@GetUser() user: any, @Body() body: any) {
    return this.client.send(ADDRESSES_PATTERNS.CREATE, { userId: user.sub, ...body });
  }

  @Put(':id')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Update alamat' })
  update(@GetUser() user: any, @Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.client.send(ADDRESSES_PATTERNS.UPDATE, { userId: user.sub, addressId: id, ...body });
  }

  @Patch(':id/primary')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Set sebagai alamat utama' })
  setPrimary(@GetUser() user: any, @Param('id', ParseIntPipe) id: number) {
    return this.client.send(ADDRESSES_PATTERNS.SET_PRIMARY, { userId: user.sub, addressId: id });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Hapus alamat' })
  delete(@GetUser() user: any, @Param('id', ParseIntPipe) id: number) {
    return this.client.send(ADDRESSES_PATTERNS.DELETE, { userId: user.sub, addressId: id });
  }
}
