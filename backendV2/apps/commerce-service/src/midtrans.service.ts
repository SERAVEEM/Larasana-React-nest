import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PaymentMethod } from '@app/shared';

export interface MidtransChargeRequest {
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  paymentMethod: PaymentMethod;
}

export interface MidtransChargeResult {
  midtransOrderId: string;
  midtransTransactionId: string;
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
    return !key || key.includes('xxxxxxxx') || key.trim() === '' || !key.startsWith('SB-');
  }

  private get serverKey(): string {
    return process.env.MIDTRANS_SERVER_KEY ?? '';
  }

  private get baseUrl(): string {
    const isSandbox = process.env.MIDTRANS_IS_SANDBOX !== 'false';
    return isSandbox
      ? 'https://api.sandbox.midtrans.com/v2'
      : 'https://api.midtrans.com/v2';
  }

  private get snapBaseUrl(): string {
    const isSandbox = process.env.MIDTRANS_IS_SANDBOX !== 'false';
    return isSandbox
      ? 'https://app.sandbox.midtrans.com/snap/v1'
      : 'https://app.midtrans.com/snap/v1';
  }

  private get authHeader(): string {
    return 'Basic ' + Buffer.from(this.serverKey + ':').toString('base64');
  }

  async charge(req: MidtransChargeRequest): Promise<MidtransChargeResult> {
    const expiryTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 jam

    if (this.isMockMode) {
      this.logger.log(`Running in mock mode. Simulating Midtrans response for ${req.paymentMethod}`);
      const mockTransId = 'mock-trans-' + Math.floor(Math.random() * 1000000).toString();
      const mockSnapToken = 'mock-token-' + Math.floor(Math.random() * 1000000).toString();
      const qrImageUrl = req.paymentMethod === 'qris'
        ? 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=http://localhost:5173/payment-success'
        : null;
      const vaNumber = req.paymentMethod !== 'qris'
        ? '8806' + Math.floor(1000000000 + Math.random() * 9000000000).toString()
        : null;
      const paymentUrl = req.paymentMethod === 'qris'
        ? `https://app.sandbox.midtrans.com/snap/v2/vtweb/${mockSnapToken}`
        : null;

      return {
        midtransOrderId: req.orderId,
        midtransTransactionId: mockTransId,
        paymentUrl,
        qrString: req.paymentMethod === 'qris' ? 'MOCK_QRIS_STRING' : null,
        qrImageUrl,
        vaNumber,
        expiryTime,
        rawResponse: { mock: true },
      };
    }

    let body: any;
    let endpoint: string;

    if (req.paymentMethod === 'qris') {
      endpoint = `${this.snapBaseUrl}/transactions`;
      body = this.buildSnapPayload(req, expiryTime);
    } else {
      endpoint = `${this.baseUrl}/charge`;
      body = this.buildCorePayload(req, expiryTime);
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: this.authHeader,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        this.logger.error('Midtrans error', data);
        throw new InternalServerErrorException(
          `Gagal memproses pembayaran: ${data?.error_messages?.[0] ?? 'Unknown error'}`,
        );
      }

      return this.parseResponse(req, data, expiryTime);
    } catch (err: any) {
      if (err instanceof InternalServerErrorException) throw err;
      this.logger.error('Midtrans request failed', err);
      throw new InternalServerErrorException('Tidak bisa terhubung ke payment gateway');
    }
  }

  async getStatus(midtransOrderId: string): Promise<any> {
    if (this.isMockMode) {
      // Extract timestamp from the end of LRS-code-timestamp
      const parts = midtransOrderId.split('-');
      const timestampStr = parts[parts.length - 1];
      const timestamp = Number(timestampStr);

      // Keep transaction pending for 30 seconds to allow inspecting the QR code or VA number in UI
      const isPending = !isNaN(timestamp) && (Date.now() - timestamp < 30000);

      return {
        transaction_status: isPending ? 'pending' : 'settlement',
        fraud_status: 'accept',
        transaction_id: 'mock-trans-id-999',
        gross_amount: '122.00'
      };
    }
    const res = await fetch(`${this.baseUrl}/${midtransOrderId}/status`, {
      headers: { Authorization: this.authHeader },
    });
    return res.json();
  }

  async cancel(midtransOrderId: string): Promise<any> {
    if (this.isMockMode) {
      return { transaction_status: 'cancel' };
    }
    const res = await fetch(`${this.baseUrl}/${midtransOrderId}/cancel`, {
      method: 'POST',
      headers: { Authorization: this.authHeader },
    });
    return res.json();
  }

  verifySignature(
    orderId: string,
    statusCode: string,
    grossAmount: string,
    signatureKey: string,
  ): boolean {
    const crypto = require('crypto');
    const input = orderId + statusCode + grossAmount + this.serverKey;
    const expected = crypto.createHash('sha512').update(input).digest('hex');
    return expected === signatureKey;
  }

  private buildSnapPayload(req: MidtransChargeRequest, expiryTime: Date): any {
    return {
      transaction_details: {
        order_id: req.orderId,
        gross_amount: req.amount,
      },
      customer_details: {
        first_name: req.customerName,
        email: req.customerEmail,
      },
      item_details: req.items.map((i) => ({
        id: i.id,
        name: i.name.substring(0, 50),
        price: i.price,
        quantity: i.quantity,
      })),
      enabled_payments: this.getEnabledPayments(req.paymentMethod),
      expiry: {
        start_time: this.formatMidtransTime(new Date()),
        unit: 'hours',
        duration: 24,
      },
    };
  }

  private buildCorePayload(req: MidtransChargeRequest, expiryTime: Date): any {
    const base = {
      transaction_details: {
        order_id: req.orderId,
        gross_amount: req.amount,
      },
      customer_details: {
        first_name: req.customerName,
        email: req.customerEmail,
      },
      item_details: req.items.map((i) => ({
        id: i.id,
        name: i.name.substring(0, 50),
        price: i.price,
        quantity: i.quantity,
      })),
    };

    switch (req.paymentMethod) {
      case 'bank_transfer':
      case 'va_bca':
        return { ...base, payment_type: 'bank_transfer', bank_transfer: { bank: 'bca' } };
      case 'va_bni':
        return { ...base, payment_type: 'bank_transfer', bank_transfer: { bank: 'bni' } };
      case 'va_bri':
        return { ...base, payment_type: 'bank_transfer', bank_transfer: { bank: 'bri' } };
      case 'va_mandiri':
        return { ...base, payment_type: 'echannel', echannel: { bill_info1: 'LARASANA', bill_info2: 'Order' } };
      case 'gopay':
        return { ...base, payment_type: 'gopay', gopay: { enable_callback: true } };
      case 'shopeepay':
        return { ...base, payment_type: 'shopeepay', shopeepay: { callback_url: process.env.FRONTEND_URL } };
      default:
        return { ...base, payment_type: 'qris', qris: { acquirer: 'gopay' } };
    }
  }

  private parseResponse(
    req: MidtransChargeRequest,
    data: any,
    expiryTime: Date,
  ): MidtransChargeResult {
    return {
      midtransOrderId: req.orderId,
      midtransTransactionId: data.transaction_id ?? null,
      paymentUrl: data.redirect_url ?? data.payment_url ?? null,
      qrString: data.qr_string ?? null,
      qrImageUrl: data.qr_image_url ?? null,
      vaNumber:
        data.va_numbers?.[0]?.va_number ??
        data.permata_va_number ??
        data.bill_key ?? null,
      expiryTime,
      rawResponse: data,
    };
  }

  private getEnabledPayments(method: PaymentMethod): string[] {
    if (method === 'qris') return ['other_qris'];
    return [method.replace('va_', '')];
  }

  private formatMidtransTime(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return (
      `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
      `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())} +0700`
    );
  }
}
