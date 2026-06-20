import { Injectable } from '@nestjs/common';
import { Address, ShippingMethod } from '../../../../../libs/shared/src';
import { ShippingProvider } from './shipping-provider.interface';

@Injectable()
export class BiteshipProvider implements ShippingProvider {
  async fetchRates(address: Address): Promise<ShippingMethod[]> {
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

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch('https://api.biteship.com/v1/rates/couriers', {
        method: 'POST',
        headers: {
          'authorization': apiKey,
          'content-type': 'application/json'
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

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
          id: 5000 + idx,
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

  private async getBiteshipAreaId(address: Address, apiKey: string): Promise<string | null> {
    try {
      const query = new URLSearchParams({
        countries: address.country || 'ID',
        input: address.city || ''
      });
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const response = await fetch(`https://api.biteship.com/v1/maps/areas?${query.toString()}`, {
        headers: { 'authorization': apiKey },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

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
}
