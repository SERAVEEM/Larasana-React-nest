import { ApiProperty } from '@nestjs/swagger';

export class CheckoutOrderDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'LRS-20260603-1234' })
  orderCode: string;

  @ApiProperty({ example: 135.00 })
  totalAmount: number;

  @ApiProperty({ example: 'pending' })
  status: string;
}

export class CheckoutPaymentDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'va_bca' })
  method: string;

  @ApiProperty({ example: 135.00 })
  amount: number;

  @ApiProperty({ example: 'pending' })
  status: string;

  @ApiProperty({ example: 'https://app.sandbox.midtrans.com/snap/v2/vtlink/123', nullable: true })
  paymentUrl: string | null;

  @ApiProperty({ example: 'https://example.com/qr.png', nullable: true })
  qrImageUrl: string | null;

  @ApiProperty({ example: '12345678901', nullable: true })
  vaNumber: string | null;

  @ApiProperty({ example: '2026-06-04T07:13:46Z', nullable: true })
  expiryTime: string | null;
}

export class CheckoutResponseDto {
  @ApiProperty({ type: CheckoutOrderDto })
  order: CheckoutOrderDto;

  @ApiProperty({ type: CheckoutPaymentDto })
  payment: CheckoutPaymentDto;
}

export class PaymentStatusResponseDto {
  @ApiProperty({ example: 1 })
  orderId: number;

  @ApiProperty({ example: 'processing' })
  orderStatus: string;

  @ApiProperty({ example: 'paid' })
  paymentStatus: string;

  @ApiProperty({ example: '2026-06-03T07:15:20Z', nullable: true })
  paidAt: Date | null;
}
