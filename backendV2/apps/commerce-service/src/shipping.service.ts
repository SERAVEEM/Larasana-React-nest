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

  private async getRajaOngkirCityId(address: Address, apiKey: string): Promise<string | null> {
    if (!address) return null;

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

      // We will try to match from the most specific to most general address fields
      const candidates = [
        address.city,
        address.district,
        address.province
      ].filter(Boolean);

      for (const candidate of candidates) {
        const target = cleanName(candidate);
        if (!target) continue;

        // Try exact match first
        let match = this.citiesCache.find(c => cleanName(c.city_name) === target);
        if (match) return match.city_id;

        // Try substring match
        match = this.citiesCache.find(c => cleanName(c.city_name).includes(target) || target.includes(cleanName(c.city_name)));
        if (match) return match.city_id;
      }

      // If still no match, search if any city name from the cache is present anywhere in the address fields
      const fullAddressText = `${address.fullAddress} ${address.district} ${address.city} ${address.province}`.toLowerCase();
      const match = this.citiesCache.find(c => {
        const cleanCity = cleanName(c.city_name);
        return cleanCity.length > 2 && fullAddressText.includes(cleanCity);
      });

      if (match) return match.city_id;

      return null;
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
      const destinationCityId = await this.getRajaOngkirCityId(address, apiKey);
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

  private async getBiteshipAreaId(address: Address, apiKey: string): Promise<string | null> {
    try {
      const query = new URLSearchParams({
        countries: address.country || 'ID',
        input: address.city || ''
      });
      const response = await fetch(`https://api.biteship.com/v1/maps/areas?${query.toString()}`, {
        headers: { 'authorization': apiKey }
      });
      if (!response.ok) {
        console.error('Biteship maps area API failed:', response.status);
        return null;
      }
      const resJson = await response.json() as any;
      const areas = resJson.areas || [];
      return areas.length > 0 ? areas[0].id : null;
    } catch (err) {
      console.error('Failed to get Biteship area ID:', err);
      return null;
    }
  }

  private async fetchBiteshipRates(address: Address): Promise<ShippingMethod[]> {
    const apiKey = process.env.BITESHIP_API_KEY;
    if (!apiKey || apiKey.trim() === '') return [];

    const originPostalCode = Number(process.env.BITESHIP_ORIGIN_POSTAL_CODE || '83355');
    const usdRate = Number(process.env.RAJAONGKIR_USD_RATE || '15000');

    try {
      // 1. Find area ID
      const destinationAreaId = await this.getBiteshipAreaId(address, apiKey);

      // 2. Query rates
      const body: any = {
        origin_postal_code: originPostalCode,
        couriers: 'jne,pos,tiki,dhl,fedex,ems',
        items: [
          {
            name: 'Tenun Fabric',
            weight: 1000,
            quantity: 1,
            value: 150000
          }
        ]
      };

      if (destinationAreaId) {
        body.destination_area_id = destinationAreaId;
      } else {
        const destZip = Number(address.postalCode);
        if (!isNaN(destZip) && destZip > 0) {
          body.destination_postal_code = destZip;
        } else {
          body.destination_postal_code = 12240;
        }
      }

      const response = await fetch('https://api.biteship.com/v1/rates/couriers', {
        method: 'POST',
        headers: {
          'authorization': apiKey,
          'content-type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('Biteship rates API failed:', response.status, errText);
        return [];
      }

      const resJson = await response.json() as any;
      const pricings = resJson.pricing || [];

      return pricings.map((p: any, idx: number) => {
        const costValue = p.price || 0;
        const costInUsd = Number((costValue / usdRate).toFixed(2));
        const estimatedDays = p.duration || '3-5 business days';

        return {
          id: 500 + idx,
          courier: String(p.courier_code).toUpperCase(),
          service: String(p.courier_service_name).toUpperCase(),
          label: `${String(p.courier_name)} ${String(p.courier_service_name)}`,
          baseCost: costInUsd,
          estimatedDays,
          isActive: true
        } as any;
      });
    } catch (err) {
      console.error('Failed to query Biteship rates:', err);
      return [];
    }
  }

  async getAll(data?: { addressId?: number }): Promise<ShippingMethod[]> {
    if (data?.addressId) {
      const address = await this.addressRepo.findOne({ where: { id: data.addressId } });
      if (address) {
        // Try Biteship first if key is configured (works for both ID and global)
        const biteshipKey = process.env.BITESHIP_API_KEY;
        if (biteshipKey && biteshipKey.trim() !== '') {
          const rates = await this.fetchBiteshipRates(address);
          if (rates.length > 0) return rates;
        }

        if (address.country === 'ID') {
          const rajaOngkirKey = process.env.RAJAONGKIR_API_KEY;
          if (rajaOngkirKey && rajaOngkirKey.trim() !== '') {
            const rates = await this.fetchRajaOngkirRates(address);
            if (rates.length > 0) return rates;
          }

          // Fallback static domestic rates if live RajaOngkir/Biteship fails or is down
          return [
            {
              id: 301,
              courier: 'JNE',
              service: 'REG',
              label: 'JNE Regular (Domestic Fallback)',
              baseCost: 1.50,
              estimatedDays: '3-5 hari',
              isActive: true,
            } as any,
            {
              id: 302,
              courier: 'POS',
              service: 'KILAT',
              label: 'POS Kilat Khusus (Domestic Fallback)',
              baseCost: 1.20,
              estimatedDays: '4-7 hari',
              isActive: true,
            } as any,
            {
              id: 303,
              courier: 'TIKI',
              service: 'REG',
              label: 'TIKI Regular (Domestic Fallback)',
              baseCost: 1.40,
              estimatedDays: '4-6 hari',
              isActive: true,
            } as any,
          ];
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
    if (id >= 500) {
      if (addressId) {
        const address = await this.addressRepo.findOne({ where: { id: addressId } });
        if (address) {
          const rates = await this.fetchBiteshipRates(address);
          const match = rates.find((r) => r.id === id);
          if (match) return match;
        }
      }
      return {
        id,
        courier: 'DHL',
        service: 'INT',
        label: 'DHL Express International (Biteship)',
        baseCost: 25.00,
        estimatedDays: '3-5 business days',
        isActive: true,
      } as any;
    }

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
    const fallbackCities = [
      { city_id: '152', province_id: '6', province: 'DKI Jakarta', type: 'Kota', city_name: 'Jakarta Barat', postal_code: '11220' },
      { city_id: '151', province_id: '6', province: 'DKI Jakarta', type: 'Kota', city_name: 'Jakarta Pusat', postal_code: '10110' },
      { city_id: '153', province_id: '6', province: 'DKI Jakarta', type: 'Kota', city_name: 'Jakarta Selatan', postal_code: '12110' },
      { city_id: '154', province_id: '6', province: 'DKI Jakarta', type: 'Kota', city_name: 'Jakarta Timur', postal_code: '13110' },
      { city_id: '155', province_id: '6', province: 'DKI Jakarta', type: 'Kota', city_name: 'Jakarta Utara', postal_code: '14110' },
      { city_id: '23', province_id: '9', province: 'Jawa Barat', type: 'Kota', city_name: 'Bandung', postal_code: '40111' },
      { city_id: '444', province_id: '11', province: 'Jawa Timur', type: 'Kota', city_name: 'Surabaya', postal_code: '60111' },
      { city_id: '278', province_id: '34', province: 'Sumatera Utara', type: 'Kota', city_name: 'Medan', postal_code: '20111' },
      { city_id: '273', province_id: '22', province: 'Nusa Tenggara Barat', type: 'Kota', city_name: 'Mataram', postal_code: '83111' },
      { city_id: '233', province_id: '22', province: 'Nusa Tenggara Barat', type: 'Kabupaten', city_name: 'Lombok Barat', postal_code: '83351' },
      { city_id: '234', province_id: '22', province: 'Nusa Tenggara Barat', type: 'Kabupaten', city_name: 'Lombok Tengah', postal_code: '83511' },
      { city_id: '235', province_id: '22', province: 'Nusa Tenggara Barat', type: 'Kabupaten', city_name: 'Lombok Timur', postal_code: '83611' },
      { city_id: '236', province_id: '22', province: 'Nusa Tenggara Barat', type: 'Kabupaten', city_name: 'Lombok Utara', postal_code: '83711' },
      { city_id: '114', province_id: '1', province: 'Bali', type: 'Kota', city_name: 'Denpasar', postal_code: '80111' },
      { city_id: '399', province_id: '10', province: 'Jawa Tengah', type: 'Kota', city_name: 'Semarang', postal_code: '50111' },
      { city_id: '501', province_id: '5', province: 'DI Yogyakarta', type: 'Kota', city_name: 'Yogyakarta', postal_code: '55111' },
      { city_id: '457', province_id: '3', province: 'Banten', type: 'Kota', city_name: 'Tangerang', postal_code: '15111' },
      { city_id: '55', province_id: '9', province: 'Jawa Barat', type: 'Kota', city_name: 'Bekasi', postal_code: '17111' },
      { city_id: '115', province_id: '9', province: 'Jawa Barat', type: 'Kota', city_name: 'Depok', postal_code: '16411' },
      { city_id: '75', province_id: '9', province: 'Jawa Barat', type: 'Kota', city_name: 'Bogor', postal_code: '16111' }
    ];

    if (!apiKey || apiKey.trim() === '') return fallbackCities;

    try {
      if (!this.citiesCache) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        const response = await fetch('https://api.rajaongkir.com/starter/city', {
          headers: { 'key': apiKey },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          console.error('RajaOngkir: Failed to fetch city list:', response.status);
          this.citiesCache = fallbackCities;
        } else {
          const resJson = await response.json() as any;
          this.citiesCache = resJson.rajaongkir?.results || fallbackCities;
        }
      }
      return this.citiesCache;
    } catch (err) {
      console.warn('RajaOngkir city fetch failed or timed out, using fallback cities list. Error:', err.message || err);
      this.citiesCache = fallbackCities;
      return this.citiesCache;
    }
  }
}
// Trigger incremental compilation to bind to port 3002 after cleanup
