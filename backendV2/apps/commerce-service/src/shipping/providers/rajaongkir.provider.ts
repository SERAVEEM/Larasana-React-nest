import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Address, ShippingMethod } from '../../../../../libs/shared/src';
import { ShippingProvider } from './shipping-provider.interface';

@Injectable()
export class RajaOngkirProvider implements ShippingProvider {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}


  async fetchRates(address: Address): Promise<ShippingMethod[]> {
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
      let rateId = 3000;

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

  private async getRajaOngkirCityId(address: Address, apiKey: string): Promise<string | null> {
    if (!address) return null;

    try {
      const cities = await this.getCities();
      const cleanName = (name: string) => name.toLowerCase().replace(/kabupaten|kab\.|kota|city/g, '').trim();

      const candidates = [
        address.city,
        address.district,
        address.province
      ].filter(Boolean);

      for (const candidate of candidates) {
        const target = cleanName(candidate);
        if (!target) continue;

        // Try exact match first
        let match = cities.find(c => cleanName(c.city_name) === target);
        if (match) return match.city_id;

        // Try substring match
        match = cities.find(c => cleanName(c.city_name).includes(target) || target.includes(cleanName(c.city_name)));
        if (match) return match.city_id;
      }

      const fullAddressText = `${address.fullAddress} ${address.district} ${address.city} ${address.province}`.toLowerCase();
      const match = cities.find(c => {
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

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const response = await fetch('https://api.rajaongkir.com/starter/cost', {
        method: 'POST',
        headers: {
          'key': apiKey,
          'content-type': 'application/x-www-form-urlencoded'
        },
        body: body.toString(),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errText = await response.text();
        console.error(`RajaOngkir cost error for ${courierCode}:`, response.status, errText);
        return [];
      }

      const resJson = await response.json() as any;
      return resJson.rajaongkir?.results || [];
    } catch (err) {
      console.error(`Failed to fetch RajaOngkir cost for ${courierCode}:`, err);
      return [];
    }
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
      const cacheKey = 'shipping:cities';
      const cached = await this.cacheManager.get<any[]>(cacheKey);
      if (cached) return cached;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const response = await fetch('https://api.rajaongkir.com/starter/city', {
        headers: { 'key': apiKey },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error('RajaOngkir: Failed to fetch city list:', response.status);
        return fallbackCities;
      } else {
        const resJson = await response.json() as any;
        const results = resJson.rajaongkir?.results;
        if (results && Array.isArray(results) && results.length > 0) {
          await this.cacheManager.set(cacheKey, results, 24 * 60 * 60 * 1000);
          return results;
        }
        return fallbackCities;
      }
    } catch (err) {
      console.warn('RajaOngkir city fetch failed or timed out, using fallback cities list. Error:', err.message || err);
      return fallbackCities;
    }

  }
}
