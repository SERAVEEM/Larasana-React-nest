import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PaymentsService } from './payments.service';
import { PAYMENTS_PATTERNS } from '../../../libs/shared/src';

@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @MessagePattern(PAYMENTS_PATTERNS.CHECKOUT)
  checkout(@Payload() data: any) {
    return this.paymentsService.checkout(data);
  }

  @MessagePattern(PAYMENTS_PATTERNS.GET_STATUS)
  getStatus(@Payload() data: { userId: number; orderId: number }) {
    return this.paymentsService.getPaymentStatus(data.userId, data.orderId);
  }

  @MessagePattern(PAYMENTS_PATTERNS.WEBHOOK)
  handleWebhook(@Payload() payload: any) {
    return this.paymentsService.handleWebhook(payload);
  }
}
