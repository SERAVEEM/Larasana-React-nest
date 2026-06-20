import { Controller, Post, Get, Body, Param, UseGuards, Inject, ParseIntPipe, HttpCode, HttpStatus, Query, Sse, MessageEvent } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiOkResponse, ApiCreatedResponse, ApiUnauthorizedResponse, ApiBadRequestResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { Subject, Observable, from } from 'rxjs';
import { retry, map, tap } from 'rxjs/operators';
import { SERVICES, PAYMENTS_PATTERNS } from '../../../../libs/shared/src';
import { JwtAuthGuard } from '../common/guards';
import { GetUser } from '../common/get-user.decorator';
import { CheckoutDto } from './dto/checkout.dto';
import { CheckoutResponseDto, PaymentStatusResponseDto } from './dto/checkout-response.dto';
import { BadRequestResponseDto, UnauthorizedResponseDto, NotFoundResponseDto } from '../common/dto/error-response.dto';


@ApiTags('checkout')
@Controller('checkout')
export class CheckoutGatewayController {
  constructor(@Inject(SERVICES.PAYMENTS) private client: ClientProxy) { }

  private readonly paymentSubjects = new Map<number, Subject<string>>();

  private getOrCreateSubject(orderId: number): Subject<string> {
    let subject = this.paymentSubjects.get(orderId);
    if (!subject) {
      subject = new Subject<string>();
      this.paymentSubjects.set(orderId, subject);
    }
    return subject;
  }

  private notifyPaymentUpdate(orderId: number, status: string) {
    const subject = this.paymentSubjects.get(orderId);
    if (subject) {
      subject.next(status);
      if (status === 'paid' || status === 'cancelled' || status === 'failed' || status === 'expired') {
        subject.complete();
        this.paymentSubjects.delete(orderId);
      }
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Proses checkout — buat order + charge Midtrans' })
  @ApiCreatedResponse({ type: CheckoutResponseDto, description: 'Checkout berhasil dibuat' })
  @ApiBadRequestResponse({ type: BadRequestResponseDto, description: 'Gagal membuat checkout (input tidak valid)' })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponseDto })
  checkout(@GetUser() user: any, @Body() body: CheckoutDto) {
    return this.client.send(PAYMENTS_PATTERNS.CHECKOUT, { user: { id: user.sub, name: user.name, email: user.email }, ...body })
      .pipe(
        tap((res: any) => {
          if (res && res.orderId) {
            this.notifyPaymentUpdate(res.orderId, 'pending');
          }
        })
      );
  }

  @Get('payment-status/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'orderId' })
  @ApiOperation({ summary: 'Cek status pembayaran (polling setiap 3 detik)' })
  @ApiOkResponse({ type: PaymentStatusResponseDto, description: 'Status pembayaran berhasil diambil' })
  @ApiNotFoundResponse({ type: NotFoundResponseDto, description: 'Order tidak ditemukan' })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponseDto })
  getStatus(
    @GetUser() user: any,
    @Param('orderId', ParseIntPipe) orderId: number,
    @Query('simulate') simulate?: string,
  ) {
    return this.client.send(PAYMENTS_PATTERNS.GET_STATUS, { userId: user.sub, orderId, simulate })
      .pipe(
        retry({ count: 2, delay: 300 }),
        tap((res: any) => {
          if (res && res.status) {
            this.notifyPaymentUpdate(orderId, res.status);
          }
        })
      );
  }

  @Post('webhook/midtrans')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook Midtrans (otomatis dipanggil Midtrans)' })
  @ApiOkResponse({ schema: { type: 'object', properties: { received: { type: 'boolean', example: true } } }, description: 'Webhook diproses' })
  @ApiBadRequestResponse({ type: BadRequestResponseDto, description: 'Signature tidak valid' })
  webhook(@Body() payload: any) {
    return this.client.send(PAYMENTS_PATTERNS.WEBHOOK, payload)
      .pipe(
        tap((res: any) => {
          if (res && res.orderId && res.status) {
            this.notifyPaymentUpdate(res.orderId, res.status);
          }
        })
      );
  }

  @Sse('payment-status/:orderId/stream')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'orderId' })
  @ApiOperation({ summary: 'Stream status pembayaran via SSE (menggantikan polling)' })
  paymentStatusStream(
    @GetUser() user: any,
    @Param('orderId', ParseIntPipe) orderId: number,
  ): Observable<MessageEvent> {
    const subject = this.getOrCreateSubject(orderId);

    const initial$ = from(
      this.client.send(PAYMENTS_PATTERNS.GET_STATUS, { userId: user.sub, orderId })
        .pipe(
          retry({ count: 2, delay: 300 }),
          map((res: any) => res.status)
        )
    );

    return new Observable<MessageEvent>(subscriber => {
      let isFinal = false;

      const pushEvent = (status: string) => {
        subscriber.next({ data: { status } } as any);
        if (status === 'paid' || status === 'cancelled' || status === 'failed' || status === 'expired') {
          isFinal = true;
          subscriber.complete();
        }
      };

      const initialSub = initial$.subscribe({
        next: (status) => pushEvent(status),
        error: (err) => subscriber.error(err),
      });

      const subjectSub = subject.subscribe({
        next: (status) => pushEvent(status),
        complete: () => {
          if (!isFinal) subscriber.complete();
        },
        error: (err) => subscriber.error(err),
      });

      return () => {
        initialSub.unsubscribe();
        subjectSub.unsubscribe();
      };
    });
  }
}

