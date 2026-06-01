// src/payments/midtrans.service.ts
//
// Midtrans adalah payment gateway Indonesia yang support:
// QRIS, GoPay, ShopeePay, Virtual Account (BCA/BNI/BRI/Mandiri), dll
//
// Setup:
// 1. Daftar di https://midtrans.com
// 2. Masuk ke Sandbox untuk testing
// 3. Ambil Server Key & Client Key dari Settings > Access Keys
// 4. Isi di .env

import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PaymentMethod } from './entities/payment.entity';

export interface MidtransChargeRequest {
  orderId: string;         // unik per transaksi
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

  // ── CHARGE PAYMENT ─────────────────────────────────────────
  async charge(req: MidtransChargeRequest): Promise<MidtransChargeResult> {
    const expiryTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 jam

    let body: any;
    let endpoint: string;

    // QRIS — gunakan Snap API (paling mudah, support semua method termasuk QRIS)
    if (req.paymentMethod === 'qris') {
      endpoint = `${this.snapBaseUrl}/transactions`;
      body = this.buildSnapPayload(req, expiryTime);
    } else {
      // Core API untuk Virtual Account & E-wallet spesifik
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

  // ── GET TRANSACTION STATUS ─────────────────────────────────
  async getStatus(midtransOrderId: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/${midtransOrderId}/status`, {
      headers: { Authorization: this.authHeader },
    });
    return res.json();
  }

  // ── CANCEL TRANSACTION ─────────────────────────────────────
  async cancel(midtransOrderId: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/${midtransOrderId}/cancel`, {
      method: 'POST',
      headers: { Authorization: this.authHeader },
    });
    return res.json();
  }

  // ── VERIFY NOTIFICATION SIGNATURE ─────────────────────────
  // Dipakai di webhook endpoint untuk verifikasi payload dari Midtrans
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

  // ── PRIVATE: Build Snap payload ────────────────────────────
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

  // ── PRIVATE: Build Core API payload ───────────────────────
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

  // ── PRIVATE: Parse Midtrans response ──────────────────────
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
    // Format: "2024-01-01 12:00:00 +0700"
    const pad = (n: number) => n.toString().padStart(2, '0');
    return (
      `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
      `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())} +0700`
    );
  }
}
