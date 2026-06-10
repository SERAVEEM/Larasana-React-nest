import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShippingMethod, Address } from '../../../libs/shared/src';

// ---------------------------------------------------------------------------
// ISO-2 country-code normalisation map.
// Add more aliases as needed; comparisons are case-insensitive.
// ---------------------------------------------------------------------------
const COUNTRY_ALIAS_MAP: Record<string, string> = {
  'INDONESIA':          'ID',
  'UNITED STATES':      'US',
  'USA':                'US',
  'UNITED STATES OF AMERICA': 'US',
  'MALAYSIA':           'MY',
  'SINGAPORE':          'SG',
  'AUSTRALIA':          'AU',
  'UNITED KINGDOM':     'GB',
  'UK':                 'GB',
  'GREAT BRITAIN':      'GB',
  'GERMANY':            'DE',
  'FRANCE':             'FR',
  'JAPAN':              'JP',
  'SOUTH KOREA':        'KR',
  'KOREA':              'KR',
  'CHINA':              'CN',
  'NETHERLANDS':        'NL',
  'CANADA':             'CA',
  'NEW ZEALAND':        'NZ',
  'THAILAND':           'TH',
  'PHILIPPINES':        'PH',
  'VIETNAM':            'VN',
  'INDIA':              'IN',
  'SAUDI ARABIA':       'SA',
  'UNITED ARAB EMIRATES': 'AE',
  'UAE':                'AE',
};

// ---------------------------------------------------------------------------
// Static fallback city list.  Covers the ~20 most common Indonesian cities so
// RajaOngkir queries can still proceed when the city-list API is unreachable.
// ---------------------------------------------------------------------------
const FALLBACK_CITIES = [
  { city_id: '152', province_id: '6',  province: 'DKI Jakarta',          type: 'Kota',      city_name: 'Jakarta Barat',   postal_code: '11220' },
  { city_id: '151', province_id: '6',  province: 'DKI Jakarta',          type: 'Kota',      city_name: 'Jakarta Pusat',   postal_code: '10110' },
  { city_id: '153', province_id: '6',  province: 'DKI Jakarta',          type: 'Kota',      city_name: 'Jakarta Selatan', postal_code: '12110' },
  { city_id: '154', province_id: '6',  province: 'DKI Jakarta',          type: 'Kota',      city_name: 'Jakarta Timur',   postal_code: '13110' },
  { city_id: '155', province_id: '6',  province: 'DKI Jakarta',          type: 'Kota',      city_name: 'Jakarta Utara',   postal_code: '14110' },
  { city_id: '23',  province_id: '9',  province: 'Jawa Barat',           type: 'Kota',      city_name: 'Bandung',         postal_code: '40111' },
  { city_id: '444', province_id: '11', province: 'Jawa Timur',           type: 'Kota',      city_name: 'Surabaya',        postal_code: '60111' },
  { city_id: '278', province_id: '34', province: 'Sumatera Utara',       type: 'Kota',      city_name: 'Medan',           postal_code: '20111' },
  { city_id: '273', province_id: '22', province: 'Nusa Tenggara Barat',  type: 'Kota',      city_name: 'Mataram',         postal_code: '83111' },
  { city_id: '224', province_id: '22', province: 'Nusa Tenggara Barat',  type: 'Kabupaten', city_name: 'Lombok Barat',    postal_code: '83351' },
  { city_id: '234', province_id: '22', province: 'Nusa Tenggara Barat',  type: 'Kabupaten', city_name: 'Lombok Tengah',   postal_code: '83511' },
  { city_id: '235', province_id: '22', province: 'Nusa Tenggara Barat',  type: 'Kabupaten', city_name: 'Lombok Timur',    postal_code: '83611' },
  { city_id: '236', province_id: '22', province: 'Nusa Tenggara Barat',  type: 'Kabupaten', city_name: 'Lombok Utara',    postal_code: '83711' },
  { city_id: '114', province_id: '1',  province: 'Bali',                 type: 'Kota',      city_name: 'Denpasar',        postal_code: '80111' },
  { city_id: '399', province_id: '10', province: 'Jawa Tengah',          type: 'Kota',      city_name: 'Semarang',        postal_code: '50111' },
  { city_id: '501', province_id: '5',  province: 'DI Yogyakarta',        type: 'Kota',      city_name: 'Yogyakarta',      postal_code: '55111' },
  { city_id: '457', province_id: '3',  province: 'Banten',               type: 'Kota',      city_name: 'Tangerang',       postal_code: '15111' },
  { city_id: '55',  province_id: '9',  province: 'Jawa Barat',           type: 'Kota',      city_name: 'Bekasi',          postal_code: '17111' },
  { city_id: '115', province_id: '9',  province: 'Jawa Barat',           type: 'Kota',      city_name: 'Depok',           postal_code: '16411' },
  { city_id: '75',  province_id: '9',  province: 'Jawa Barat',           type: 'Kota',      city_name: 'Bogor',           postal_code: '16111' },
  { city_id: '376', province_id: '28', province: 'Riau',                 type: 'Kota',      city_name: 'Pekanbaru',       postal_code: '28111' },
  { city_id: '18',  province_id: '2',  province: 'Sumatera Selatan',     type: 'Kota',      city_name: 'Palembang',       postal_code: '30111' },
  { city_id: '62',  province_id: '7',  province: 'Gorontalo',            type: 'Kota',      city_name: 'Gorontalo',       postal_code: '96115' },
  { city_id: '197', province_id: '14', province: 'Kalimantan Timur',     type: 'Kota',      city_name: 'Samarinda',       postal_code: '75111' },
  { city_id: '196', province_id: '14', province: 'Kalimantan Timur',     type: 'Kota',      city_name: 'Balikpapan',      postal_code: '76111' },
  { city_id: '418', province_id: '31', province: 'Sulawesi Selatan',     type: 'Kota',      city_name: 'Makassar',        postal_code: '90111' },
  { city_id: '178', province_id: '18', province: 'Lampung',              type: 'Kota',      city_name: 'Bandar Lampung',  postal_code: '35111' },
  { city_id: '81',  province_id: '32', province: 'Sulawesi Utara',       type: 'Kota',      city_name: 'Manado',          postal_code: '95111' },
  { city_id: '5',   province_id: '30', province: 'Aceh',                 type: 'Kota',      city_name: 'Banda Aceh',      postal_code: '23111' },
  { city_id: '38',  province_id: '9',  province: 'Jawa Barat',           type: 'Kota',      city_name: 'Cimahi',          postal_code: '40511' },
];

// ---------------------------------------------------------------------------
// Static fallback rates shown to the user when live APIs are unavailable.
// ---------------------------------------------------------------------------
const FALLBACK_DOMESTIC_RATES: any[] = [
  {
    id: 901, courier: 'JNE', service: 'REG',
    label: 'JNE Regular (Estimated)', baseCost: 2.00,
    estimatedDays: '3-5 hari', isActive: true,
    currency: 'USD', originalCost: 30000, originalCurrency: 'IDR',
  },
  {
    id: 902, courier: 'JNE', service: 'YES',
    label: 'JNE YES – 1 Day Service (Estimated)', baseCost: 4.00,
    estimatedDays: '1 hari', isActive: true,
    currency: 'USD', originalCost: 60000, originalCurrency: 'IDR',
  },
  {
    id: 903, courier: 'POS', service: 'KILAT',
    label: 'POS Kilat Khusus (Estimated)', baseCost: 1.50,
    estimatedDays: '4-7 hari', isActive: true,
    currency: 'USD', originalCost: 22500, originalCurrency: 'IDR',
  },
  {
    id: 904, courier: 'TIKI', service: 'REG',
    label: 'TIKI Regular (Estimated)', baseCost: 1.80,
    estimatedDays: '4-6 hari', isActive: true,
    currency: 'USD', originalCost: 27000, originalCurrency: 'IDR',
  },
];

const FALLBACK_INTERNATIONAL_RATES: any[] = [
  {
    id: 801, courier: 'DHL', service: 'EXPRESS',
    label: 'DHL Express International (Estimated)', baseCost: 25.00,
    estimatedDays: '3-5 business days', isActive: true,
    currency: 'USD', originalCost: 25.00, originalCurrency: 'USD',
  },
  {
    id: 802, courier: 'FEDEX', service: 'PRIORITY',
    label: 'FedEx International Priority (Estimated)', baseCost: 35.00,
    estimatedDays: '2-3 business days', isActive: true,
    currency: 'USD', originalCost: 35.00, originalCurrency: 'USD',
  },
  {
    id: 803, courier: 'EMS', service: 'STANDARD',
    label: 'EMS International Standard (Estimated)', baseCost: 15.00,
    estimatedDays: '7-10 business days', isActive: true,
    currency: 'USD', originalCost: 15.00, originalCurrency: 'USD',
  },
];

@Injectable()
export class ShippingService {
  /** In-memory city-list cache (populated lazily). */
  private citiesCache: any[] | null = null;

  constructor(
    @InjectRepository(ShippingMethod)
    private readonly shippingRepo: Repository<ShippingMethod>,

    @InjectRepository(Address)
    private readonly addressRepo: Repository<Address>,
  ) {}

  // =========================================================================
  // SECTION 1 – Country normalisation
  // =========================================================================

  /**
   * Convert an arbitrary country string to a strict ISO-3166-1 alpha-2 code.
   * If the input is already a 2-letter code it is returned as-is (uppercased).
   * Unknown values default to 'ID' (Indonesia).
   */
  private normaliseCountry(raw: string | undefined | null): string {
    if (!raw) return 'ID';
    const trimmed = raw.trim().toUpperCase();
    if (trimmed.length === 2) return trimmed; // already ISO-2
    return COUNTRY_ALIAS_MAP[trimmed] ?? 'ID';
  }

  // =========================================================================
  // SECTION 2 – RajaOngkir city-list helpers
  // =========================================================================

  /**
   * Fetch and cache the RajaOngkir city list.
   * Falls back to FALLBACK_CITIES on network failure or missing API key.
   */
  async getCities(): Promise<any[]> {
    if (this.citiesCache) return this.citiesCache;

    const apiKey = process.env.RAJAONGKIR_API_KEY?.trim();
    if (!apiKey) {
      this.citiesCache = FALLBACK_CITIES;
      return this.citiesCache;
    }

    try {
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 3000);

      const response = await fetch('https://api.rajaongkir.com/starter/city', {
        headers: { key: apiKey },
        signal: controller.signal,
      });
      clearTimeout(tid);

      if (!response.ok) {
        console.warn(`RajaOngkir city-list fetch failed (${response.status}), using fallback.`);
        this.citiesCache = FALLBACK_CITIES;
      } else {
        const json = (await response.json()) as any;
        const results = json?.rajaongkir?.results;
        this.citiesCache = Array.isArray(results) && results.length > 0
          ? results
          : FALLBACK_CITIES;
      }
    } catch (err: any) {
      console.warn('RajaOngkir city-list fetch timed out or errored, using fallback. Error:', err?.message ?? err);
      this.citiesCache = FALLBACK_CITIES;
    }

    return this.citiesCache;
  }

  /**
   * Map an Address object to a RajaOngkir numeric city_id string.
   *
   * Strategy (most-to-least specific):
   *   1. Exact name match on address.city
   *   2. Substring match on address.city
   *   3. Exact name match on address.district
   *   4. Substring match on address.district
   *   5. Exact name match on address.province
   *   6. Full-address text scan
   *
   * Returns null when nothing matches.
   */
  private async getRajaOngkirCityId(address: Address): Promise<string | null> {
    if (!address) return null;

    try {
      const cities = await this.getCities();

      const clean = (s: string) =>
        s.toLowerCase()
          .replace(/\b(kabupaten|kab\.|kota|city|regency|municipality)\b/g, '')
          .replace(/\s+/g, ' ')
          .trim();

      /**
       * Try to find a matching city_id given a candidate string.
       * Returns the city_id string on match, or null.
       */
      const tryMatch = (candidate: string): string | null => {
        if (!candidate?.trim()) return null;
        const target = clean(candidate);
        if (!target) return null;

        // 1. Exact clean match
        let hit = cities.find((c) => clean(c.city_name) === target);
        if (hit) return hit.city_id;

        // 2. Cache-entry is a substring of target (e.g. "Jakarta" inside "Jakarta Selatan")
        hit = cities.find((c) => target.includes(clean(c.city_name)) && clean(c.city_name).length > 3);
        if (hit) return hit.city_id;

        // 3. Target is a substring of cache-entry (e.g. "Bandung" inside "Kabupaten Bandung Barat")
        hit = cities.find((c) => clean(c.city_name).includes(target) && target.length > 3);
        if (hit) return hit.city_id;

        return null;
      };

      // Ordered candidates – most specific first
      const candidates = [
        address.city,
        address.district,
        address.province,
      ];

      for (const c of candidates) {
        const id = tryMatch(c);
        if (id) return id;
      }

      // Last resort: scan all city names across the full address string
      const fullText = [
        address.fullAddress,
        address.district,
        address.city,
        address.province,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const fallback = cities.find((c) => {
        const name = clean(c.city_name);
        return name.length > 3 && fullText.includes(name);
      });

      return fallback ? fallback.city_id : null;
    } catch (err: any) {
      console.error('getRajaOngkirCityId failed:', err?.message ?? err);
      return null;
    }
  }

  // =========================================================================
  // SECTION 3 – RajaOngkir cost query
  // =========================================================================

  /**
   * Fetch shipping cost from the RajaOngkir /starter/cost endpoint for a
   * single courier code.  Returns an empty array on any error so callers
   * can aggregate results from multiple couriers safely.
   */
  private async fetchRajaOngkirCost(
    origin: string,
    destination: string,
    courierCode: string,
    apiKey: string,
    weight: number,
  ): Promise<any[]> {
    try {
      const body = new URLSearchParams({
        origin,
        destination,
        weight: String(weight > 0 ? weight : 1000),
        courier: courierCode,
      });

      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 8000);

      const response = await fetch('https://api.rajaongkir.com/starter/cost', {
        method: 'POST',
        headers: {
          key: apiKey,
          'content-type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
        signal: controller.signal,
      });
      clearTimeout(tid);

      if (!response.ok) {
        const errText = await response.text();
        console.error(`RajaOngkir cost [${courierCode}] HTTP ${response.status}:`, errText);
        return [];
      }

      const json = (await response.json()) as any;
      return json?.rajaongkir?.results ?? [];
    } catch (err: any) {
      console.error(`RajaOngkir cost [${courierCode}] fetch error:`, err?.message ?? err);
      return [];
    }
  }

  // =========================================================================
  // SECTION 4 – RajaOngkir rate aggregation
  // =========================================================================

  /**
   * Query JNE, POS, and TIKI in parallel from the hardcoded Lombok Barat
   * origin (city_id = '224') and map results to ShippingMethod-compatible
   * objects.
   *
   * Returns fallback domestic rates (never throws) when:
   *   - API key is missing
   *   - City ID lookup fails
   *   - All courier queries return empty
   *   - Any unexpected exception
   */
  private async fetchRajaOngkirRates(
    address: Address,
    weight: number,
    usdRate: number,
  ): Promise<{ success: boolean; data: any[]; message?: string }> {
    const apiKey = process.env.RAJAONGKIR_API_KEY?.trim();

    if (!apiKey) {
      console.info('RajaOngkir API key not configured → returning domestic fallback rates.');
      return { success: true, data: FALLBACK_DOMESTIC_RATES, message: 'Estimated domestic rates (API key not configured).' };
    }

    // Hardcoded origin: Lombok Barat (RajaOngkir city_id = '224')
    const ORIGIN_CITY_ID = '224';

    try {
      // ── 1. Resolve destination city ID ──────────────────────────────────
      const destinationCityId = await this.getRajaOngkirCityId(address);

      if (!destinationCityId) {
        console.warn(
          `RajaOngkir: Cannot resolve city ID for "${address.city}" → returning domestic fallback rates.`,
        );
        return {
          success: true,
          data: FALLBACK_DOMESTIC_RATES,
          message: `Estimated rates shown — destination city "${address.city}" not found in courier database.`,
        };
      }

      // ── 2. Query couriers in parallel ───────────────────────────────────
      const couriers = ['jne', 'pos', 'tiki'];
      const courierResults = await Promise.all(
        couriers.map((code) =>
          this.fetchRajaOngkirCost(ORIGIN_CITY_ID, destinationCityId, code, apiKey, weight),
        ),
      );

      // ── 3. Map results ──────────────────────────────────────────────────
      const rates: any[] = [];
      courierResults.forEach((resultList, courierIdx) => {
        resultList.forEach((res: any) => {
          const courierCode = (res.code ?? couriers[courierIdx]).toUpperCase();
          const services: any[] = res.costs ?? [];
          services.forEach((s: any, serviceIdx: number) => {
            const costValue: number = s.cost?.[0]?.value ?? 0;
            const costInUsd = Number((costValue / usdRate).toFixed(2));
            const etd: string = s.cost?.[0]?.etd ?? '';
            const estimatedDays = etd
              ? etd.includes('hari') || etd.includes('day')
                ? etd
                : `${etd} hari`
              : '3-5 hari';

            rates.push({
              id: 300 + courierIdx * 20 + serviceIdx,
              courier: courierCode,
              service: s.service ?? '',
              label: `${courierCode} ${s.service} (${s.description ?? ''})`.trim(),
              baseCost: costInUsd,
              estimatedDays,
              isActive: true,
              currency: 'USD',
              originalCost: costValue,
              originalCurrency: 'IDR',
            });
          });
        });
      });

      if (rates.length === 0) {
        console.warn('RajaOngkir returned zero rates for all couriers → returning domestic fallback rates.');
        return {
          success: true,
          data: FALLBACK_DOMESTIC_RATES,
          message: 'Estimated rates shown — live courier rates temporarily unavailable.',
        };
      }

      return { success: true, data: rates };
    } catch (err: any) {
      console.error('fetchRajaOngkirRates unexpected error:', err?.message ?? err);
      return {
        success: true,
        data: FALLBACK_DOMESTIC_RATES,
        message: 'Estimated rates shown — shipping provider temporarily unavailable.',
      };
    }
  }

  // =========================================================================
  // SECTION 5 – EasyPost rate query
  // =========================================================================

  /**
   * Strip null / undefined values from an object (shallow, one level deep).
   * EasyPost rejects payloads that contain explicit null fields.
   */
  private sanitisePayload(obj: Record<string, any>): Record<string, any> {
    return Object.fromEntries(
      Object.entries(obj).filter(([, v]) => v !== null && v !== undefined && v !== ''),
    );
  }

  /**
   * Query EasyPost for international rates from the hardcoded Lombok Barat
   * warehouse address.
   *
   * Returns fallback international rates (never throws) when:
   *   - API key is missing
   *   - EasyPost returns a non-200 status
   *   - Any unexpected exception
   */
  private async fetchEasyPostRates(
    address: Address,
    weight: number,
  ): Promise<{ success: boolean; data: any[]; message?: string }> {
    const apiKey = process.env.EASYPOST_API_KEY?.trim();

    if (!apiKey) {
      console.info('EasyPost API key not configured → returning international fallback rates.');
      return {
        success: true,
        data: FALLBACK_INTERNATIONAL_RATES,
        message: 'Estimated international rates (API key not configured).',
      };
    }

    try {
      const authHeader = 'Basic ' + Buffer.from(`${apiKey}:`).toString('base64');
      // EasyPost expects weight in ounces; 1 gram ≈ 0.035274 oz
      const weightInOz = weight > 0 ? Number((weight * 0.035274).toFixed(2)) : 17.64;

      // ── Sanitise to_address ──────────────────────────────────────────────
      const isoCountry = this.normaliseCountry(address.country);
      const rawToAddress: Record<string, any> = {
        name:    address.recipientName,
        street1: address.fullAddress,
        city:    address.city,
        state:   address.province,
        zip:     address.postalCode,
        country: isoCountry,
        phone:   address.phone,
      };
      const toAddress = this.sanitisePayload(rawToAddress);

      // ── Hardcoded from_address (Lombok Barat warehouse) ─────────────────
      const fromAddress = {
        company: 'Larasana Tenun Lombok',
        street1: 'Jl. Raya Senggigi, Batu Layar',
        city:    'Mataram',
        state:   'Nusa Tenggara Barat',
        zip:     '83111',
        country: 'ID',
        phone:   '+6281234567890',
      };

      const payload = {
        shipment: {
          to_address:   toAddress,
          from_address: fromAddress,
          parcel: this.sanitisePayload({ weight: weightInOz }),
        },
      };

      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 10000);

      const response = await fetch('https://api.easypost.com/v2/shipments', {
        method:  'POST',
        headers: {
          Authorization:  authHeader,
          'Content-Type': 'application/json',
        },
        body:   JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(tid);

      if (!response.ok) {
        const errText = await response.text();
        console.error(`EasyPost HTTP ${response.status}:`, errText);
        return {
          success: true,
          data:    FALLBACK_INTERNATIONAL_RATES,
          message: `Estimated rates shown — EasyPost returned error ${response.status}.`,
        };
      }

      const json = (await response.json()) as any;
      const apiRates: any[] = json?.rates ?? [];

      if (apiRates.length === 0) {
        return {
          success: true,
          data:    FALLBACK_INTERNATIONAL_RATES,
          message: 'Estimated rates shown — no EasyPost rates returned for this destination.',
        };
      }

      const mapped = apiRates.map((r: any, idx: number) => ({
        id:            200 + idx,
        courier:       (r.carrier ?? 'CARRIER').toUpperCase(),
        service:       (r.service ?? '').toUpperCase(),
        label:         `${r.carrier} ${r.service}`.trim(),
        baseCost:      Number(r.rate ?? 0),
        estimatedDays: r.delivery_days ? `${r.delivery_days} days` : '3-5 days',
        isActive:      true,
        currency:      'USD',
        originalCost:  Number(r.rate ?? 0),
        originalCurrency: 'USD',
      }));

      return { success: true, data: mapped };
    } catch (err: any) {
      console.error('fetchEasyPostRates unexpected error:', err?.message ?? err);
      return {
        success: true,
        data:    FALLBACK_INTERNATIONAL_RATES,
        message: 'Estimated rates shown — international shipping provider temporarily unavailable.',
      };
    }
  }

  // =========================================================================
  // SECTION 6 – Public API
  // =========================================================================

  /**
   * Main entry point called by the microservice controller.
   *
   * Priority resolution order for the shipping address:
   *   1. addressId  →  load real Address row from DB
   *   2. destination_country / destination_city  →  build a transient Address
   *   3. No address info  →  return database-stored ShippingMethod rows (or
   *      combined domestic + international fallbacks)
   *
   * This method NEVER throws.  All error paths return structured fallback
   * rates so the frontend always has something to display.
   *
   * Response shape:  { success: true, data: ShippingOption[], message?: string }
   */
  async getAll(data?: {
    addressId?:           number;
    weight?:              number;
    destination_country?: string;
    destination_city?:    string;
  }): Promise<{ success: boolean; data: any[]; message?: string }> {
    const weight  = data?.weight && data.weight > 0 ? data.weight : 1000;
    const usdRate = Number(process.env.RAJAONGKIR_USD_RATE?.trim() || '15000');

    try {
      // ── Step 1: Resolve Address ────────────────────────────────────────
      let address: Address | null = null;

      if (data?.addressId) {
        address = await this.addressRepo
          .findOne({ where: { id: data.addressId } })
          .catch(() => null);

        if (!address) {
          console.warn(`ShippingService.getAll: addressId=${data.addressId} not found in DB → returning fallback rates.`);
          return {
            success: true,
            data:    FALLBACK_DOMESTIC_RATES,
            message: 'Estimated rates shown — address not found.',
          };
        }
      } else if (data?.destination_country) {
        // Build a transient Address object for estimation purposes
        const isoCountry  = this.normaliseCountry(data.destination_country);
        const isDomestic  = isoCountry === 'ID';
        address = {
          id:            0,
          userId:        0,
          label:         'Estimator',
          recipientName: 'Valued Customer',
          phone:         '081234567890',
          fullAddress:   isDomestic ? 'Jl. Sudirman No. 1' : '123 Main St',
          district:      '',
          city:          data.destination_city ?? (isDomestic ? 'Jakarta Pusat' : 'New York'),
          province:      isDomestic ? 'DKI Jakarta' : '',
          postalCode:    isDomestic ? '10110' : '10001',
          country:       isoCountry,
          isPrimary:     false,
          createdAt:     new Date(),
          updatedAt:     new Date(),
          user:          null as any,
        };
      }

      // ── Step 2: Dispatch to the correct shipping provider ─────────────
      if (address) {
        const isoCountry = this.normaliseCountry(address.country);

        if (isoCountry === 'ID') {
          // ── Domestic: RajaOngkir ────────────────────────────────────
          return await this.fetchRajaOngkirRates(address, weight, usdRate);
        } else {
          // ── International: EasyPost ─────────────────────────────────
          return await this.fetchEasyPostRates(address, weight);
        }
      }

      // ── Step 3: No address info — return DB-stored methods (or fallback) ─
      const methods = await this.shippingRepo
        .find({ where: { isActive: true }, order: { baseCost: 'ASC' } })
        .catch(() => [] as ShippingMethod[]);

      if (methods.length > 0) {
        return {
          success: true,
          data: methods.map((m) => ({
            ...m,
            baseCost:         Number((Number(m.baseCost) / usdRate).toFixed(2)),
            currency:         'USD',
            originalCost:     Number(m.baseCost),
            originalCurrency: 'IDR',
          })),
        };
      }

      // Absolute last resort — return combined domestic + international estimates
      return {
        success: true,
        data:    [...FALLBACK_DOMESTIC_RATES, ...FALLBACK_INTERNATIONAL_RATES],
        message: 'Estimated rates shown — no address provided.',
      };
    } catch (outerErr: any) {
      // Safety net — this block should theoretically never be reached because
      // every inner call already handles its own errors.
      console.error('ShippingService.getAll unhandled error (outer catch):', outerErr?.message ?? outerErr);
      return {
        success: true,
        data:    [...FALLBACK_DOMESTIC_RATES, ...FALLBACK_INTERNATIONAL_RATES],
        message: 'Estimated shipping rates shown due to a temporary service error.',
      };
    }
  }

  /**
   * Retrieve a single ShippingMethod by ID.
   * IDs ≥ 300 → RajaOngkir dynamic rate
   * IDs 200–299 → EasyPost dynamic rate
   * IDs 801–803 → international fallback
   * IDs 901–904 → domestic fallback
   * Otherwise → DB lookup
   */
  async findById(id: number, addressId?: number, weight?: number, usdRate?: number): Promise<ShippingMethod> {
    const effectiveUsdRate = usdRate || Number(process.env.RAJAONGKIR_USD_RATE?.trim() || '15000');
    const effectiveWeight  = weight  && weight > 0 ? weight : 1000;

    // ── Domestic fallback IDs ──────────────────────────────────────────────
    const domesticFallback = FALLBACK_DOMESTIC_RATES.find((r) => r.id === id);
    if (domesticFallback) return domesticFallback as any;

    // ── International fallback IDs ─────────────────────────────────────────
    const intlFallback = FALLBACK_INTERNATIONAL_RATES.find((r) => r.id === id);
    if (intlFallback) return intlFallback as any;

    // ── RajaOngkir dynamic IDs (≥ 300) ────────────────────────────────────
    if (id >= 300) {
      if (addressId) {
        const address = await this.addressRepo.findOne({ where: { id: addressId } }).catch(() => null);
        if (address) {
          const res = await this.fetchRajaOngkirRates(address, effectiveWeight, effectiveUsdRate);
          const match = res.data.find((r: any) => r.id === id);
          if (match) return match;
        }
      }
      // Fallback for unknown RajaOngkir dynamic ID
      return FALLBACK_DOMESTIC_RATES[0] as any;
    }

    // ── EasyPost dynamic IDs (200–299) ────────────────────────────────────
    if (id >= 200) {
      if (addressId) {
        const address = await this.addressRepo.findOne({ where: { id: addressId } }).catch(() => null);
        if (address) {
          const res = await this.fetchEasyPostRates(address, effectiveWeight);
          const match = res.data.find((r: any) => r.id === id);
          if (match) return match;
        }
      }
      return FALLBACK_INTERNATIONAL_RATES[0] as any;
    }

    // ── DB lookup ──────────────────────────────────────────────────────────
    const method = await this.shippingRepo.findOne({ where: { id, isActive: true } });
    if (!method) throw new NotFoundException('Metode pengiriman tidak ditemukan');

    return {
      ...method,
      baseCost:         Number((Number(method.baseCost) / effectiveUsdRate).toFixed(2)),
      currency:         'USD',
      originalCost:     Number(method.baseCost),
      originalCurrency: 'IDR',
    } as any;
  }
}
