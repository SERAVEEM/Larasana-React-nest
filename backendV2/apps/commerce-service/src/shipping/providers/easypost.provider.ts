import { Injectable } from '@nestjs/common';
import { Address, ShippingMethod } from '../../../../../libs/shared/src';
import { ShippingProvider } from './shipping-provider.interface';

@Injectable()
export class EasyPostProvider implements ShippingProvider {
  async fetchRates(address: Address): Promise<ShippingMethod[]> {
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

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch('https://api.easypost.com/v2/shipments', {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('EasyPost API returned error status:', response.status, errorText);
        return [];
      }

      const resJson = await response.json() as any;
      const rates = resJson.rates || [];

      return rates.map((r: any, idx: number) => ({
        id: 2000 + idx,
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
}
