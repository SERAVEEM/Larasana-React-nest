import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShippingMethod, Address } from '../../../libs/shared/src';

@Injectable()
export class ShippingService {
  private citiesCache: any[] | null = null;

  constructor(
    @InjectRepository(ShippingMethod)
    private readonly shippingRepo: Repository<ShippingMethod>,

    @InjectRepository(Address)
    private readonly addressRepo: Repository<Address>,
  ) {}

  private async getRajaOngkirCityId(cityName: string, apiKey: string): Promise<string | null> {
    if (!cityName) return null;

    try {
      if (!this.citiesCache) {
        const response = await fetch('https://api.rajaongkir.com/starter/city', {
          headers: { 'key': apiKey }
        });

        if (!response.ok) {
          console.error('RajaOngkir: Failed to fetch city list:', response.status);
          return null;
        }

        const resJson = await response.json() as any;
        this.citiesCache = resJson.rajaongkir?.results || [];
      }

      const cleanName = (name: string) => name.toLowerCase().replace(/kabupaten|kab\.|kota|city/g, '').trim();
      const target = cleanName(cityName);

      // Try exact clean match
      let match = this.citiesCache.find(c => cleanName(c.city_name) === target);

      // Fallback: search if target is a substring of the city name
      if (!match) {
        match = this.citiesCache.find(c => cleanName(c.city_name).includes(target) || target.includes(cleanName(c.city_name)));
      }

      return match ? match.city_id : null;
    } catch (err) {
      console.error('RajaOngkir city lookup failed:', err);
      return null;
    }
  }

  private async fetchRajaOngkirCost(
    origin: string,
    destination: string,
    courierCode: string,
    apiKey: string,
  ): Promise<any[]> {
    try {
      const body = new URLSearchParams({
        origin,
        destination,
        weight: '1000',
        courier: courierCode
      });

      const response = await fetch('https://api.rajaongkir.com/starter/cost', {
        method: 'POST',
        headers: {
          'key': apiKey,
          'content-type': 'application/x-www-form-urlencoded'
        },
        body: body.toString()
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`RajaOngkir cost error for ${courierCode}:`, response.status, errText);
        return [];
      }

      const resJson = await response.json() as any;
      const results = resJson.rajaongkir?.results || [];
      return results;
    } catch (err) {
      console.error(`Failed to fetch RajaOngkir cost for ${courierCode}:`, err);
      return [];
    }
  }

  private async fetchRajaOngkirRates(address: Address): Promise<ShippingMethod[]> {
    const apiKey = process.env.RAJAONGKIR_API_KEY;
    if (!apiKey || apiKey.trim() === '') return [];

    const origin = process.env.RAJAONGKIR_ORIGIN || '233'; // Default Lombok Barat
    const usdRate = Number(process.env.RAJAONGKIR_USD_RATE || '15000');

    try {
      // 1. Get destination city ID
      const destinationCityId = await this.getRajaOngkirCityId(address.city, apiKey);
      if (!destinationCityId) {
        console.warn(`RajaOngkir: No matching city ID found for "${address.city}"`);
        return [];
      }

      // 2. Query JNE, POS, and TIKI in parallel
      const couriers = ['jne', 'pos', 'tiki'];
      const promises = couriers.map((courier) =>
        this.fetchRajaOngkirCost(origin, destinationCityId, courier, apiKey)
      );

      const courierResults = await Promise.all(promises);

      // 3. Map results to ShippingMethod structure
      const rates: ShippingMethod[] = [];
      let rateId = 300;

      courierResults.forEach((resultList) => {
        resultList.forEach((res: any) => {
          const courierCode = res.code.toUpperCase();
          const services = res.costs || [];
          services.forEach((s: any) => {
            const costValue = s.cost?.[0]?.value || 0;
            const costInUsd = Number((costValue / usdRate).toFixed(2));
            const etd = s.cost?.[0]?.etd || '';
            const estimatedDays = etd ? (etd.includes('hari') || etd.includes('day') ? etd : `${etd} hari`) : '3-5 hari';

            rates.push({
              id: rateId++,
              courier: courierCode,
              service: s.service,
              label: `${courierCode} ${s.service} (${s.description})`,
              baseCost: costInUsd,
              estimatedDays,
              isActive: true,
            } as any);
          });
        });
      });

      return rates;
    } catch (err) {
      console.error('Failed to get RajaOngkir rates:', err);
      return [];
    }
  }

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
      if (address) {
        if (address.country === 'ID') {
          const rajaOngkirKey = process.env.RAJAONGKIR_API_KEY;
          if (rajaOngkirKey && rajaOngkirKey.trim() !== '') {
            const rates = await this.fetchRajaOngkirRates(address);
            if (rates.length > 0) return rates;
          }
        } else {
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
    }

    return this.shippingRepo.find({
      where: { isActive: true },
      order: { baseCost: 'ASC' },
    });
  }

  async findById(id: number, addressId?: number): Promise<ShippingMethod> {
    if (id >= 300) {
      if (addressId) {
        const address = await this.addressRepo.findOne({ where: { id: addressId } });
        if (address) {
          const rates = await this.fetchRajaOngkirRates(address);
          const match = rates.find((r) => r.id === id);
          if (match) return match;
        }
      }
      return {
        id,
        courier: 'JNE',
        service: 'REG',
        label: 'JNE Regular (RajaOngkir)',
        baseCost: 1.00,
        estimatedDays: '3-5 business days',
        isActive: true,
      } as any;
    }

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

  async getCities(): Promise<any[]> {
    const apiKey = process.env.RAJAONGKIR_API_KEY;
    if (!apiKey || apiKey.trim() === '') return [];

    try {
      if (!this.citiesCache) {
        const response = await fetch('https://api.rajaongkir.com/starter/city', {
          headers: { 'key': apiKey }
        });

        if (!response.ok) {
          console.error('RajaOngkir: Failed to fetch city list:', response.status);
          return [];
        }

        const resJson = await response.json() as any;
        this.citiesCache = resJson.rajaongkir?.results || [];
      }
      return this.citiesCache;
    } catch (err) {
      console.error('Failed to get RajaOngkir cities list:', err);
      return [];
    }
  }
}
