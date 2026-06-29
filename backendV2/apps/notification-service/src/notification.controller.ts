import { Controller, UseFilters } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { NotificationService } from './notification.service';
import { NOTIFICATION_PATTERNS, AllExceptionsToRpcFilter } from '../../../libs/shared/src';

@UseFilters(AllExceptionsToRpcFilter)
@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @MessagePattern(NOTIFICATION_PATTERNS.SEND_OTP)
  sendOtp(@Payload() data: { email: string; name: string; otp: string }) {
    return this.notificationService.sendVerificationOtp(data.email, data.name, data.otp);
  }

  @MessagePattern(NOTIFICATION_PATTERNS.SEND_RESET_LINK)
  sendResetLink(@Payload() data: { email: string; name: string; resetLink: string }) {
    return this.notificationService.sendPasswordReset(data.email, data.name, data.resetLink);
  }
}
