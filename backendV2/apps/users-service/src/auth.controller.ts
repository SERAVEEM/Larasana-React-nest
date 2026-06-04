import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { AUTH_PATTERNS } from '../../../libs/shared/src';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern(AUTH_PATTERNS.REGISTER)
  register(@Payload() data: { name: string; email: string; password: string; meta: any }) {
    return this.authService.register(data);
  }

  @MessagePattern(AUTH_PATTERNS.LOGIN)
  login(@Payload() data: { email: string; password: string; meta: any }) {
    return this.authService.login(data);
  }

  @MessagePattern(AUTH_PATTERNS.REFRESH)
  refresh(@Payload() data: { refreshToken: string; sub: number; email: string; role: string; meta: any }) {
    return this.authService.refreshTokens(data);
  }

  @MessagePattern(AUTH_PATTERNS.LOGOUT)
  logout(@Payload() data: { userId: number; refreshToken: string }) {
    return this.authService.logout(data.userId, data.refreshToken);
  }

  @MessagePattern(AUTH_PATTERNS.LOGOUT_ALL)
  logoutAll(@Payload() data: { userId: number }) {
    return this.authService.logoutAll(data.userId);
  }

  @MessagePattern(AUTH_PATTERNS.SEND_OTP)
  sendOtp(@Payload() data: { userId: number }) {
    return this.authService.sendVerificationOtp(data.userId);
  }

  @MessagePattern(AUTH_PATTERNS.VERIFY_EMAIL)
  verifyEmail(@Payload() data: { userId: number; token: string }) {
    return this.authService.verifyEmail(data.userId, data.token);
  }

  @MessagePattern(AUTH_PATTERNS.FORGOT_PASSWORD)
  forgotPassword(@Payload() data: { email: string }) {
    return this.authService.forgotPassword(data.email);
  }

  @MessagePattern(AUTH_PATTERNS.RESET_PASSWORD)
  resetPassword(@Payload() data: { resetToken: string; newPassword: string }) {
    return this.authService.resetPassword(data.resetToken, data.newPassword);
  }
}
