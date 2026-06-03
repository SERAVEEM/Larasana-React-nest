import {
  Controller, Post, Get, Body, Req, Inject, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiTags, ApiOperation, ApiBearerAuth, ApiCreatedResponse, ApiOkResponse,
  ApiBadRequestResponse, ApiUnauthorizedResponse, ApiConflictResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { SERVICES, AUTH_PATTERNS } from '../../../../libs/shared/src';
import { JwtAuthGuard } from '../common/guards';
import { GetUser } from '../common/get-user.decorator';
import { JwtService } from '@nestjs/jwt';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

import { AuthResponseDto, TokensDto, MessageResponseDto } from './dto/auth-response.dto';
import { BadRequestResponseDto, UnauthorizedResponseDto, ConflictResponseDto } from '../common/dto/error-response.dto';
import { User } from '../../../../libs/shared/src/entities/user.entity';

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
  @ApiCreatedResponse({ type: AuthResponseDto, description: 'Registrasi berhasil' })
  @ApiBadRequestResponse({ type: BadRequestResponseDto, description: 'Input tidak valid' })
  @ApiConflictResponse({ type: ConflictResponseDto, description: 'Email sudah terdaftar' })
  register(@Body() body: RegisterDto, @Req() req: Request) {
    return this.authClient.send(AUTH_PATTERNS.REGISTER, { ...body, meta: this.meta(req) });
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login' })
  @ApiOkResponse({ type: AuthResponseDto, description: 'Login berhasil' })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponseDto, description: 'Kredensial salah atau akun tidak aktif' })
  login(@Body() body: LoginDto, @Req() req: Request) {
    return this.authClient.send(AUTH_PATTERNS.LOGIN, { ...body, meta: this.meta(req) });
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiOkResponse({ type: TokensDto, description: 'Token berhasil di-refresh' })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponseDto, description: 'Refresh token tidak valid atau kadaluarsa' })
  async refresh(@Body() body: RefreshDto, @Req() req: Request) {
    const payload = this.jwtService.decode(body.refreshToken) as any;
    return this.authClient.send(AUTH_PATTERNS.REFRESH, { ...payload, refreshToken: body.refreshToken, meta: this.meta(req) });
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Logout' })
  @ApiOkResponse({ type: MessageResponseDto, description: 'Logout berhasil' })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponseDto })
  logout(@GetUser('sub') userId: number, @Body() body: RefreshDto) {
    return this.authClient.send(AUTH_PATTERNS.LOGOUT, { userId, refreshToken: body.refreshToken });
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Logout semua perangkat' })
  @ApiOkResponse({ type: MessageResponseDto, description: 'Logout semua perangkat berhasil' })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponseDto })
  logoutAll(@GetUser('sub') userId: number) {
    return this.authClient.send(AUTH_PATTERNS.LOGOUT_ALL, { userId });
  }

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Kirim OTP verifikasi email' })
  @ApiOkResponse({ type: MessageResponseDto, description: 'OTP berhasil dikirim' })
  @ApiBadRequestResponse({ type: BadRequestResponseDto, description: 'User sudah terverifikasi atau tidak ditemukan' })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponseDto })
  sendOtp(@GetUser('sub') userId: number) {
    return this.authClient.send(AUTH_PATTERNS.SEND_OTP, { userId });
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Verifikasi OTP 6 digit' })
  @ApiOkResponse({ type: MessageResponseDto, description: 'Email berhasil diverifikasi' })
  @ApiBadRequestResponse({ type: BadRequestResponseDto, description: 'OTP salah atau kadaluarsa' })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponseDto })
  verifyEmail(@GetUser('sub') userId: number, @Body() body: VerifyEmailDto) {
    return this.authClient.send(AUTH_PATTERNS.VERIFY_EMAIL, { userId, token: body.token });
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Kirim link reset password' })
  @ApiOkResponse({ type: MessageResponseDto, description: 'Link reset password dikirim (jika email terdaftar)' })
  forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authClient.send(AUTH_PATTERNS.FORGOT_PASSWORD, body);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password baru' })
  @ApiOkResponse({ type: MessageResponseDto, description: 'Password berhasil direset' })
  @ApiBadRequestResponse({ type: BadRequestResponseDto, description: 'Token tidak valid' })
  resetPassword(@Body() body: ResetPasswordDto) {
    return this.authClient.send(AUTH_PATTERNS.RESET_PASSWORD, body);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Cek sesi aktif' })
  @ApiOkResponse({ type: User, description: 'Sesi aktif valid' })
  @ApiUnauthorizedResponse({ type: UnauthorizedResponseDto })
  me(@GetUser() user: any) {
    return user;
  }
}
