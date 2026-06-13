import { BaseService } from './BaseService';
import { Address } from '../domain/models/Address';
import { ShippingOption } from '../domain/models/ShippingOption';

export class CheckoutService extends BaseService {
  async getAddresses(): Promise<Address[]> {
    const rawAddresses = await this.get<any[]>('/addresses');
    if (!rawAddresses || rawAddresses.length === 0) return [];
    return rawAddresses.map((addr) => Address.fromRaw(addr));
  }

  async addAddress(address: Address): Promise<Address> {
    const payload = {
      label: address.label,
      recipientName: address.name,
      phone: address.phone,
      fullAddress: address.street,
      district: address.district || '-',
      city: address.city || '-',
      province: address.province || '-',
      postalCode: address.postalCode || '00000',
      country: address.country || 'ID'
    };

    const res = await this.post<any>('/addresses', payload);
    return Address.fromRaw(res);
  }

  async getShippingOptions(addressId?: string): Promise<ShippingOption[]> {
    const url = addressId ? `/shipping?addressId=${addressId}` : '/shipping';
    try {
      const rawOptions = await this.get<any[]>(url);
      if (rawOptions && rawOptions.length > 0) {
        return rawOptions.map((ship) => ShippingOption.fromRaw(ship));
      }
    } catch (err) {
      console.error('Failed to fetch shipping options, falling back to mocks:', err);
    }

    // Rich fallback mock rates
    return [
      new ShippingOption({ id: 'mock-1', name: 'JNE Regular (REG)', price: 1.50, eta: '3-5 hari', logo: 'JNE' }),
      new ShippingOption({ id: 'mock-2', name: 'JNE YES (1 Day Service)', price: 3.20, eta: '1 hari', logo: 'JNE' }),
      new ShippingOption({ id: 'mock-3', name: 'POS Kilat Khusus', price: 1.20, eta: '4-7 hari', logo: 'POS' }),
      new ShippingOption({ id: 'mock-4', name: 'TIKI Regular', price: 1.40, eta: '4-6 hari', logo: 'TIKI' }),
    ];
  }

  async getCitiesList(): Promise<any[]> {
    return this.get<any[]>('/shipping/cities');
  }

  async submitCheckout(payload: {
    items: { productId: number; quantity: number }[];
    addressId: number;
    shippingMethodId: number;
    paymentMethod: string;
  }): Promise<any> {
    return this.post<any>('/checkout', payload);
  }

  async getPaymentStatus(orderId: number | string): Promise<{ paymentStatus: string; orderStatus: string }> {
    return this.get<{ paymentStatus: string; orderStatus: string }>(`/checkout/payment-status/${orderId}`);
  }
}
