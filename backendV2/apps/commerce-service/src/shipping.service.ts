import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShippingMethod, Address } from '../../../libs/shared/src';

@Injectable()
export class ShippingService {
  constructor(
    @InjectRepository(ShippingMethod)
    private readonly shippingRepo: Repository<ShippingMethod>,

    @InjectRepository(Address)
    private readonly addressRepo: Repository<Address>,
  ) {}

  private async fetchEasyPostRates(address: Address): Promise<ShippingMethod[]> {
    const apiKey = process.env.EASYPOST_API_KEY;
    if (!apiKey || apiKey.trim() === '') return [];

    try {
      const authHeader = 'Basic ' + Buffer.from(apiKey + ':').toString('base64');
      const body = {
        shipment: {
          to_address: {
            name: address.recipientName,
            street1: address.fullAddress,
            city: address.city,
            state: address.province,
            zip: address.postalCode,
            country: address.country,
            phone: address.phone
          },
          from_address: {
            company: 'Larasana Tenun Shop',
            street1: 'Jl. Raya Senggigi No. 12',
            city: 'Batu Layar',
            state: 'Nusa Tenggara Barat',
            zip: '83355',
            country: 'ID',
            phone: '08111222333'
          },
          parcel: {
            weight: 17.6 // 500 grams in ounces
          }
        }
      };

      const response = await fetch('https://api.easypost.com/v2/shipments', {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('EasyPost API returned error status:', response.status, errorText);
        return [];
      }

      const resJson = await response.json() as any;
      const rates = resJson.rates || [];

      return rates.map((r: any, idx: number) => ({
        id: 200 + idx,
        courier: r.carrier.toUpperCase(),
        service: r.service.toUpperCase(),
        label: `${r.carrier} ${r.service}`,
        baseCost: Number(r.rate),
        estimatedDays: r.delivery_days ? `${r.delivery_days} days` : '3-5 days',
        isActive: true
      }));
    } catch (err) {
      console.error('Failed to query EasyPost rates:', err);
      return [];
    }
  }

  async getAll(data?: { addressId?: number }): Promise<ShippingMethod[]> {
    if (data?.addressId) {
      const address = await this.addressRepo.findOne({ where: { id: data.addressId } });
      if (address && address.country !== 'ID') {
        const apiKey = process.env.EASYPOST_API_KEY;
        if (apiKey && apiKey.trim() !== '') {
          const rates = await this.fetchEasyPostRates(address);
          if (rates.length > 0) return rates;
        }

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
    }

    return this.shippingRepo.find({
      where: { isActive: true },
      order: { baseCost: 'ASC' },
    });
  }

  async findById(id: number, addressId?: number): Promise<ShippingMethod> {
    if (id >= 200) {
      if (addressId) {
        const address = await this.addressRepo.findOne({ where: { id: addressId } });
        if (address) {
          const rates = await this.fetchEasyPostRates(address);
          const match = rates.find((r) => r.id === id);
          if (match) return match;
        }
      }
      return {
        id,
        courier: 'DHL',
        service: 'INT',
        label: 'DHL Express International',
        baseCost: 25.00,
        estimatedDays: '3-5 business days',
        isActive: true,
      } as any;
    }

    if (id >= 101 && id <= 103) {
      const mockCarriers = [
        {
          id: 101,
          courier: 'DHL',
          service: 'INT',
          label: 'DHL Express International',
          baseCost: 25.00,
          estimatedDays: '3-5 business days',
          isActive: true,
        },
        {
          id: 102,
          courier: 'FEDEX',
          service: 'PRIORITY',
          label: 'FedEx International Priority',
          baseCost: 35.00,
          estimatedDays: '2-3 business days',
          isActive: true,
        },
        {
          id: 103,
          courier: 'EMS',
          service: 'INT',
          label: 'EMS International',
          baseCost: 15.00,
          estimatedDays: '7-10 business days',
          isActive: true,
        },
      ];
      const match = mockCarriers.find((c) => c.id === id);
      if (match) return match as any;
    }

    const method = await this.shippingRepo.findOne({ where: { id, isActive: true } });
    if (!method) throw new NotFoundException('Metode pengiriman tidak ditemukan');
    return method;
  }
}
