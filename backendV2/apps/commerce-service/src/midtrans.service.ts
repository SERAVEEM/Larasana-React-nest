import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PaymentMethod } from '@app/shared';

// --- Snap transaction payload ---------------------------------------------
export interface SnapTransactionPayload {
  orderId: string;
  grossAmount: number; // in IDR, must be integer
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: Array<{
    id: string;
    name: string;
    price: number;   // in IDR per unit
    quantity: number;
  }>;
  enabledPayments?: string[];
}

export interface SnapTransactionResult {
  token: string;
  redirect_url: string;
}

export interface MidtransChargeResult {
  midtransOrderId: string;
  midtransTransactionId: string;
  snapToken: string | null;
  paymentUrl: string | null;
  qrString: string | null;
  qrImageUrl: string | null;
  vaNumber: string | null;
  expiryTime: Date;
  rawResponse: any;
}

@Injectable()
export class MidtransService {
  private readonly logger = new Logger(MidtransService.name);

  get isMockMode(): boolean {
    const key = this.serverKey;
    if (!key || key.trim() === '') return true;
    if (key.includes('xxxxxxxx')) return true;
    return false;
  }

  private get serverKey(): string {
    return process.env.MIDTRANS_SERVER_KEY ?? '';
  }

  private get isSandbox(): boolean {
    return process.env.MIDTRANS_IS_SANDBOX !== 'false';
  }

  private get snapBaseUrl(): string {
    return this.isSandbox
      ? 'https://app.sandbox.midtrans.com/snap/v1'
      : 'https://app.midtrans.com/snap/v1';
  }

  private get coreBaseUrl(): string {
    return this.isSandbox
      ? 'https://api.sandbox.midtrans.com/v2'
      : 'https://api.midtrans.com/v2';
  }

  private get authHeader(): string {
    return 'Basic ' + Buffer.from(this.serverKey + ':').toString('base64');
  }

  async createSnapTransaction(payload: SnapTransactionPayload): Promise<SnapTransactionResult> {
    if (this.isMockMode) {
      this.logger.warn('[MOCK] MidtransService is in mock mode — returning fake Snap token');
      const fakeToken = `mock-snap-${Math.random().toString(36).substring(2, 14)}-${Date.now()}`;
      return {
        token: fakeToken,
        redirect_url: `https://app.sandbox.midtrans.com/snap/v2/vtweb/${fakeToken}`,
      };
    }

    const body: any = {
      transaction_details: {
        order_id: payload.orderId,
        gross_amount: Math.round(payload.grossAmount),
      },
      customer_details: {
        first_name: payload.customerName || 'Customer',
        email: payload.customerEmail,
        ...(payload.customerPhone ? { phone: payload.customerPhone } : {}),
      },
      item_details: payload.items.map((i) => ({
        id: i.id,
        name: i.name.substring(0, 50),
        price: Math.round(i.price),
        quantity: i.quantity,
      })),
      expiry: {
        unit: 'minutes',
        duration: 60,
      },
    };

    if (payload.enabledPayments && payload.enabledPayments.length > 0) {
      body.enabled_payments = payload.enabledPayments;
    }

    const endpoint = `${this.snapBaseUrl}/transactions`;
    this.logger.debug(`[Midtrans Snap] POST ${endpoint} | order_id=${payload.orderId} | gross_amount=${body.transaction_details.gross_amount}`);

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          Authorization: this.authHeader,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json() as any;

      if (!res.ok) {
        this.logger.error('[Midtrans Snap] Request failed', JSON.stringify(data));
        const errMsgs: string[] = data?.error_messages ?? [];
        const errMsg = errMsgs.join('; ') || data?.status_message || `HTTP ${res.status}`;
        throw new InternalServerErrorException({
          message: `Gagal membuat sesi pembayaran Midtrans: ${errMsg}`,
          midtransError: {
            statusCode: data?.status_code ?? res.status,
            message: errMsg,
            raw: data,
          },
        });
      }

      if (!data.token) {
        this.logger.error('[Midtrans Snap] Response missing token field', JSON.stringify(data));
        throw new InternalServerErrorException({
          message: 'Midtrans tidak mengembalikan Snap token. Periksa konfigurasi akun Midtrans.',
          midtransError: { raw: data },
        });
      }

      this.logger.log(`[Midtrans Snap] Token created for order_id=${payload.orderId}`);
      return {
        token: data.token as string,
        redirect_url: data.redirect_url as string,
      };
    } catch (err: any) {
      if (err instanceof InternalServerErrorException) throw err;
      this.logger.error('[Midtrans Snap] Network error', err?.message ?? err);
      throw new InternalServerErrorException({
        message: 'Tidak bisa terhubung ke Midtrans payment gateway.',
        errorDetails: err?.message ?? String(err),
      });
    }
  }

  async getStatus(midtransOrderId: string): Promise<any> {
    if (this.isMockMode) {
      const parts = midtransOrderId.split('-');
      const timestamp = Number(parts[parts.length - 1]);
      const isPending = !isNaN(timestamp) && (Date.now() - timestamp < 30000);
      return {
        transaction_status: isPending ? 'pending' : 'settlement',
        fraud_status: 'accept',
        transaction_id: 'mock-trans-id-999',
        gross_amount: '122.00',
      };
    }

    try {
      const res = await fetch(`${this.coreBaseUrl}/${encodeURIComponent(midtransOrderId)}/status`, {
        headers: { Authorization: this.authHeader },
      });
      return res.json();
    } catch (err: any) {
      this.logger.error('[Midtrans] getStatus failed', err?.message);
      throw new InternalServerErrorException('Gagal mengambil status pembayaran dari Midtrans');
    }
  }

  async cancel(midtransOrderId: string): Promise<any> {
    if (this.isMockMode) {
      return { transaction_status: 'cancel' };
    }
    try {
      const res = await fetch(`${this.coreBaseUrl}/${encodeURIComponent(midtransOrderId)}/cancel`, {
        method: 'POST',
        headers: { Authorization: this.authHeader },
      });
      return res.json();
    } catch (err: any) {
      this.logger.error('[Midtrans] cancel failed', err?.message);
      throw new InternalServerErrorException('Gagal membatalkan transaksi Midtrans');
    }
  }

  verifySignature(
    orderId: string,
    statusCode: string,
    grossAmount: string,
    signatureKey: string,
  ): boolean {
    if (this.isMockMode) return true;
    const crypto = require('crypto');
    const input = orderId + statusCode + grossAmount + this.serverKey;
    const expected = crypto.createHash('sha512').update(input).digest('hex');
    return expected === signatureKey;
  }
}
