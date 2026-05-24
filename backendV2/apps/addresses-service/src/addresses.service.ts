import {
  Injectable, NotFoundException, ForbiddenException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from '../../../libs/shared/src';
import { CreateAddressDto, UpdateAddressDto } from './addresses.dto';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepo: Repository<Address>,
  ) {}

  async getMyAddresses(userId: number): Promise<Address[]> {
    return this.addressRepo.find({
      where: { userId },
      order: { isPrimary: 'DESC', createdAt: 'ASC' },
    });
  }

  async createAddress(userId: number, dto: CreateAddressDto): Promise<Address> {
    // Kalau user belum punya alamat sama sekali, jadikan primary otomatis
    const count = await this.addressRepo.count({ where: { userId } });
    const isPrimary = dto.isPrimary ?? count === 0;

    // Kalau set primary, unset yang lama
    if (isPrimary) {
      await this.addressRepo.update({ userId, isPrimary: true }, { isPrimary: false });
    }

    const address = this.addressRepo.create({
      ...dto,
      userId,
      label: dto.label ?? 'Rumah',
      isPrimary,
    });

    return this.addressRepo.save(address);
  }

  async updateAddress(userId: number, addressId: number, dto: UpdateAddressDto): Promise<Address> {
    const address = await this.findOneOrFail(userId, addressId);

    if (dto.isPrimary) {
      await this.addressRepo.update({ userId, isPrimary: true }, { isPrimary: false });
    }

    Object.assign(address, dto);
    return this.addressRepo.save(address);
  }

  async setPrimary(userId: number, addressId: number): Promise<Address> {
    const address = await this.findOneOrFail(userId, addressId);
    await this.addressRepo.update({ userId, isPrimary: true }, { isPrimary: false });
    address.isPrimary = true;
    return this.addressRepo.save(address);
  }

  async deleteAddress(userId: number, addressId: number): Promise<void> {
    const address = await this.findOneOrFail(userId, addressId);

    if (address.isPrimary) {
      throw new BadRequestException(
        'Tidak bisa menghapus alamat utama. Atur alamat lain sebagai utama terlebih dahulu.',
      );
    }

    await this.addressRepo.remove(address);
  }

  async findOneOrFail(userId: number, addressId: number): Promise<Address> {
    const address = await this.addressRepo.findOne({ where: { id: addressId } });
    if (!address) throw new NotFoundException('Alamat tidak ditemukan');
    if (address.userId !== userId) throw new ForbiddenException('Akses ditolak');
    return address;
  }
}
