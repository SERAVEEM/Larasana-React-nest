export interface OrderDetails {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    size: string;
  };
  pricing: {
    subtotal: number;
    shipping: number;
    total: number;
  };
  order: {
    id: number;
    orderCode: string;
    totalAmount: number;
    status: string;
  };
  payment: {
    id: number;
    method: string;
    amount: number;
    status: string;
    paymentUrl: string | null;
    qrImageUrl: string | null;
    vaNumber: string | null;
    expiryTime: string | null;
    currency?: string;
  };
}

export type PaymentState = 'idle' | 'verifying' | 'success' | 'expired';
