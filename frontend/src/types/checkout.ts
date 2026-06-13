export interface Address {
  id: string;
  label: string;
  name: string;
  street: string;
  district: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface ShippingOption {
  id: string;
  name: string;
  price: number;
  eta: string;
  logo: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  logoText: string;
  description: string;
}

export type CheckoutStepState =
  | 'loading_details'
  | 'idle'
  | 'saving_address'
  | 'submitting_checkout'
  | 'checkout_completed'
  | 'error';
