import {
  Injectable, BadRequestException, UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { User } from '../users/entities/user.entity';
import { RefreshToken } from '../users/entities/refresh-token.entity';
import { EmailVerification } from '../users/entities/email-verification.entity';
import { PasswordReset } from '../users/entities/password-reset.entity';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';
import { JwtRefreshPayload } from './strategies/jwt-refresh.strategy';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: Omit<User, 'passwordHash'>;
  tokens: AuthTokens;
}

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 12;

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,

    @InjectRepository(EmailVerification)
    private readonly emailVerifRepo: Repository<EmailVerification>,

    @InjectRepository(PasswordReset)
    private readonly passwordResetRepo: Repository<PasswordReset>,

    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  // ── REGISTER ───────────────────────────────────────────────
  async register(dto: RegisterDto, req: any): Promise<AuthResponse> {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email sudah terdaftar');

    const passwordHash = await bcrypt.hash(dto.password, this.SALT_ROUNDS);

    const user = this.userRepo.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      role: 'buyer',
      isEmailVerified: false,
      isActive: true,
    });
    await this.userRepo.save(user);

    const tokens = await this.generateAndSaveTokens(user, req);
    return { user: this.sanitizeUser(user), tokens };
  }

  // ── LOGIN ───────────────────────────────────────────────────
  async login(dto: LoginDto, req: any): Promise<AuthResponse> {
    // addSelect wajib karena passwordHash pakai select: false di entity
    const user = await this.userRepo
      .createQueryBuilder('user')
      .addSelect('user.password_hash')
      .where('user.email = :email', { email: dto.email })
      .getOne();
    if (!user) throw new UnauthorizedException('Email atau password salah');

    if (!user.isActive) throw new UnauthorizedException('Akun Anda telah dinonaktifkan');

    const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatch) throw new UnauthorizedException('Email atau password salah');

    // Verifikasi email wajib hanya untuk seller
    if (user.role === 'seller' && !user.isEmailVerified) {
      throw new UnauthorizedException(
        'Email belum diverifikasi. Cek inbox untuk kode OTP.',
      );
    }

    const tokens = await this.generateAndSaveTokens(user, req);
    return { user: this.sanitizeUser(user), tokens };
  }

  // ── REFRESH TOKEN ───────────────────────────────────────────
  async refreshTokens(payload: JwtRefreshPayload, req: any): Promise<AuthTokens> {
    const tokenHash = this.hashToken(payload.refreshToken);
    const storedToken = await this.refreshTokenRepo.findOne({
      where: { tokenHash, isRevoked: false },
      relations: ['user'],
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token tidak valid atau kadaluarsa');
    }

    if (!storedToken.user.isActive) throw new UnauthorizedException('Akun tidak aktif');

    // Revoke token lama (rotation)
    storedToken.isRevoked = true;
    await this.refreshTokenRepo.save(storedToken);

    return this.generateAndSaveTokens(storedToken.user, req);
  }

  // ── LOGOUT ──────────────────────────────────────────────────
  async logout(userId: number, refreshToken: string): Promise<void> {
    const tokenHash = this.hashToken(refreshToken);
    await this.refreshTokenRepo.update({ userId, tokenHash }, { isRevoked: true });
  }

  // ── LOGOUT ALL DEVICES ──────────────────────────────────────
  async logoutAll(userId: number): Promise<void> {
    await this.refreshTokenRepo.update({ userId, isRevoked: false }, { isRevoked: true });
  }

  // ── SEND OTP ────────────────────────────────────────────────
  async sendVerificationOtp(userId: number): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('User tidak ditemukan');
    if (user.isEmailVerified) throw new BadRequestException('Email sudah terverifikasi');

    // Invalidate OTP lama
    await this.emailVerifRepo.update({ userId, isUsed: false }, { isUsed: true });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.emailVerifRepo.save(
      this.emailVerifRepo.create({ userId, token: otp, expiresAt }),
    );

    await this.mailService.sendVerificationOtp(user.email, user.name, otp);
  }

  // ── VERIFY EMAIL ────────────────────────────────────────────
  async verifyEmail(userId: number, otp: string): Promise<void> {
    const verification = await this.emailVerifRepo.findOne({
      where: { userId, token: otp, isUsed: false, expiresAt: MoreThan(new Date()) },
    });

    if (!verification) throw new BadRequestException('Kode OTP tidak valid atau kadaluarsa');

    verification.isUsed = true;
    await this.emailVerifRepo.save(verification);
    await this.userRepo.update(userId, { isEmailVerified: true });
  }

  // ── FORGOT PASSWORD ─────────────────────────────────────────
  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) return; // silent — hindari user enumeration

    await this.passwordResetRepo.update({ userId: user.id, isUsed: false }, { isUsed: true });

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await this.passwordResetRepo.save(
      this.passwordResetRepo.create({ userId: user.id, tokenHash, expiresAt }),
    );

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}`;
    await this.mailService.sendPasswordReset(user.email, user.name, resetLink);
  }

  // ── RESET PASSWORD ──────────────────────────────────────────
  async resetPassword(rawToken: string, newPassword: string): Promise<void> {
    const tokenHash = this.hashToken(rawToken);
    const record = await this.passwordResetRepo.findOne({
      where: { tokenHash, isUsed: false, expiresAt: MoreThan(new Date()) },
    });

    if (!record) throw new BadRequestException('Link reset password tidak valid atau kadaluarsa');

    const passwordHash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);
    await this.userRepo.update(record.userId, { passwordHash });
    await this.logoutAll(record.userId);

    record.isUsed = true;
    await this.passwordResetRepo.save(record);
  }

  // ── PRIVATE HELPERS ─────────────────────────────────────────
  private async generateAndSaveTokens(user: User, req: any): Promise<AuthTokens> {
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET!,
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET!,
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
      }),
    ]);

    const tokenHash = this.hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.refreshTokenRepo.save(
      this.refreshTokenRepo.create({
        userId: user.id,
        tokenHash,
        expiresAt,
        ipAddress: req?.ip ?? null,
        userAgent: req?.headers?.['user-agent'] ?? null,
      }),
    );

    return { accessToken, refreshToken };
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private sanitizeUser(user: User): Omit<User, 'passwordHash'> {
    const sanitized = { ...user };
    delete (sanitized as any).passwordHash;
    return sanitized;
  }
}
