import {
  Controller, Post, Get, Body, Req, Inject, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { SERVICES, AUTH_PATTERNS } from '../../../../libs/shared/src';
import { JwtAuthGuard } from '../common/guards';
import { GetUser } from '../common/get-user.decorator';
import { JwtModule, JwtService } from '@nestjs/jwt';

@ApiTags('auth')
@Controller('auth')
export class AuthGatewayController {
  constructor(
    @Inject(SERVICES.AUTH) private authClient: ClientProxy,
    private jwtService: JwtService,
  ) {}

  private meta(req: Request) {
    return { ip: req.ip, userAgent: req.headers['user-agent'] };
  }

  @Post('register')
  @ApiOperation({ summary: 'Daftar akun baru (role: buyer)' })
  register(@Body() body: { name: string; email: string; password: string }, @Req() req: Request) {
    return this.authClient.send(AUTH_PATTERNS.REGISTER, { ...body, meta: this.meta(req) });
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login' })
  login(@Body() body: { email: string; password: string }, @Req() req: Request) {
    return this.authClient.send(AUTH_PATTERNS.LOGIN, { ...body, meta: this.meta(req) });
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body() body: { refreshToken: string }, @Req() req: Request) {
    const payload = this.jwtService.decode(body.refreshToken) as any;
    return this.authClient.send(AUTH_PATTERNS.REFRESH, { ...payload, refreshToken: body.refreshToken, meta: this.meta(req) });
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Logout' })
  logout(@GetUser('sub') userId: number, @Body() body: { refreshToken: string }) {
    return this.authClient.send(AUTH_PATTERNS.LOGOUT, { userId, refreshToken: body.refreshToken });
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Logout semua perangkat' })
  logoutAll(@GetUser('sub') userId: number) {
    return this.authClient.send(AUTH_PATTERNS.LOGOUT_ALL, { userId });
  }

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Kirim OTP verifikasi email' })
  sendOtp(@GetUser('sub') userId: number) {
    return this.authClient.send(AUTH_PATTERNS.SEND_OTP, { userId });
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Verifikasi OTP 6 digit' })
  verifyEmail(@GetUser('sub') userId: number, @Body() body: { token: string }) {
    return this.authClient.send(AUTH_PATTERNS.VERIFY_EMAIL, { userId, token: body.token });
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Kirim link reset password' })
  forgotPassword(@Body() body: { email: string }) {
    return this.authClient.send(AUTH_PATTERNS.FORGOT_PASSWORD, body);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password baru' })
  resetPassword(@Body() body: { resetToken: string; newPassword: string }) {
    return this.authClient.send(AUTH_PATTERNS.RESET_PASSWORD, body);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Cek sesi aktif' })
  me(@GetUser() user: any) {
    return user;
  }
}
