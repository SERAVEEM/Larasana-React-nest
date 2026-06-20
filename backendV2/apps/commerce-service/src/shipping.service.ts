import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShippingMethod, Address } from '../../../libs/shared/src';
import { RajaOngkirProvider } from './shipping/providers/rajaongkir.provider';
import { EasyPostProvider } from './shipping/providers/easypost.provider';
import { BiteshipProvider } from './shipping/providers/biteship.provider';

@Injectable()
export class ShippingService {
  constructor(
    @InjectRepository(ShippingMethod)
    private readonly shippingRepo: Repository<ShippingMethod>,

    @InjectRepository(Address)
    private readonly addressRepo: Repository<Address>,

    private readonly rajaOngkirProvider: RajaOngkirProvider,
    private readonly easyPostProvider: EasyPostProvider,
    private readonly biteshipProvider: BiteshipProvider,
  ) {}

  private getDomesticFallbacks(): ShippingMethod[] {
    return [
      {
        id: 401,
        courier: 'JNE',
        service: 'REG',
        label: 'JNE Regular (Domestic Fallback)',
        baseCost: 1.50,
        estimatedDays: '3-5 hari',
        isActive: true,
      } as any,
      {
        id: 402,
        courier: 'POS',
        service: 'KILAT',
        label: 'POS Kilat Khusus (Domestic Fallback)',
        baseCost: 1.20,
        estimatedDays: '4-7 hari',
        isActive: true,
      } as any,
      {
        id: 403,
        courier: 'TIKI',
        service: 'REG',
        label: 'TIKI Regular (Domestic Fallback)',
        baseCost: 1.40,
        estimatedDays: '4-6 hari',
        isActive: true,
      } as any,
      {
        id: 404,
        courier: 'JNE',
        service: 'YES',
        label: 'JNE YES (Domestic Fallback)',
        baseCost: 3.20,
        estimatedDays: '1-2 hari',
        isActive: true,
      } as any,
    ];
  }

  private getInternationalFallbacks(): ShippingMethod[] {
    return [
      {
        id: 101,
        courier: 'DHL',
        service: 'INT',
        label: 'DHL Express International',
        baseCost: 25.00,
        estimatedDays: '3-5 business days',
        isActive: true,
      } as any,
      {
        id: 102,
        courier: 'FEDEX',
        service: 'PRIORITY',
        label: 'FedEx International Priority',
        baseCost: 35.00,
        estimatedDays: '2-3 business days',
        isActive: true,
      } as any,
      {
        id: 103,
        courier: 'EMS',
        service: 'INT',
        label: 'EMS International',
        baseCost: 15.00,
        estimatedDays: '7-10 business days',
        isActive: true,
      } as any,
    ];
  }

  async getAll(data?: { addressId?: number }): Promise<ShippingMethod[]> {
    if (data?.addressId) {
      const address = await this.addressRepo.findOne({ where: { id: data.addressId } });
      if (address) {
        // Try Biteship first if key is configured (works for both ID and global)
        const biteshipKey = process.env.BITESHIP_API_KEY;
        if (biteshipKey && biteshipKey.trim() !== '') {
          const rates = await this.biteshipProvider.fetchRates(address);
          if (rates.length > 0) return rates;
        }

        if (address.country === 'ID') {
          const rajaOngkirKey = process.env.RAJAONGKIR_API_KEY;
          if (rajaOngkirKey && rajaOngkirKey.trim() !== '') {
            const rates = await this.rajaOngkirProvider.fetchRates(address);
            if (rates.length > 0) return rates;
          }

          // Fallback static domestic rates if live RajaOngkir/Biteship fails or is down
          return this.getDomesticFallbacks();
        } else {
          const apiKey = process.env.EASYPOST_API_KEY;
          if (apiKey && apiKey.trim() !== '') {
            const rates = await this.easyPostProvider.fetchRates(address);
            if (rates.length > 0) return rates;
          }

          return this.getInternationalFallbacks();
        }
      }
    }

    return this.shippingRepo.find({
      where: { isActive: true },
    });
  }

  async findById(id: number, addressId?: number): Promise<ShippingMethod> {
    // 1. Static fallback range - International (101 - 103)
    if (id >= 101 && id <= 103) {
      const match = this.getInternationalFallbacks().find((m) => m.id === id);
      if (match) return match;
    }

    // 2. Static fallback range - Domestic (401 - 404)
    if (id >= 401 && id <= 404) {
      const match = this.getDomesticFallbacks().find((m) => m.id === id);
      if (match) return match;
    }

    // 3. Biteship live rates (>= 5000)
    if (id >= 5000) {
      if (addressId) {
        const address = await this.addressRepo.findOne({ where: { id: addressId } });
        if (address) {
          const rates = await this.biteshipProvider.fetchRates(address);
          const match = rates.find((r) => r.id === id);
          if (match) return match;
        }
      }
      return {
        id,
        courier: 'JNE',
        service: 'REG',
        label: 'JNE Regular (Biteship Fallback)',
        baseCost: 1.00,
        estimatedDays: '3-5 business days',
        isActive: true,
      } as any;
    }

    // 4. RajaOngkir live rates (>= 3000)
    if (id >= 3000) {
      if (addressId) {
        const address = await this.addressRepo.findOne({ where: { id: addressId } });
        if (address) {
          const rates = await this.rajaOngkirProvider.fetchRates(address);
          const match = rates.find((r) => r.id === id);
          if (match) return match;
        }
      }
      return {
        id,
        courier: 'JNE',
        service: 'REG',
        label: 'JNE Regular (RajaOngkir Fallback)',
        baseCost: 1.00,
        estimatedDays: '3-5 business days',
        isActive: true,
      } as any;
    }

    // 5. EasyPost live rates (>= 2000)
    if (id >= 2000) {
      if (addressId) {
        const address = await this.addressRepo.findOne({ where: { id: addressId } });
        if (address) {
          const rates = await this.easyPostProvider.fetchRates(address);
          const match = rates.find((r) => r.id === id);
          if (match) return match;
        }
      }
      return {
        id,
        courier: 'DHL',
        service: 'INT',
        label: 'DHL Express International (EasyPost Fallback)',
        baseCost: 25.00,
        estimatedDays: '3-5 business days',
        isActive: true,
      } as any;
    }

    const method = await this.shippingRepo.findOne({ where: { id, isActive: true } });
    if (!method) throw new NotFoundException('Metode pengiriman tidak ditemukan');
    return method;
  }

  async getCities(): Promise<any[]> {
    return this.rajaOngkirProvider.getCities();
  }
}
