import { Address, ShippingMethod } from '../../../../../libs/shared/src';

export interface ShippingProvider {
  fetchRates(address: Address): Promise<ShippingMethod[]>;
}
