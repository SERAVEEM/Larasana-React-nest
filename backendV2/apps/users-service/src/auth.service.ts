import {
  Injectable, BadRequestException, UnauthorizedException, ConflictException, Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import {
  User, RefreshToken, EmailVerification, PasswordReset,
  SERVICES, NOTIFICATION_PATTERNS,
  requireSecret,
} from '../../../libs/shared/src';

@Injectable()
export class AuthService {
  private readonly SALT = 12;
  private googleClient: OAuth2Client;

  constructor(
    @InjectRepository(User)             private userRepo: Repository<User>,
    @InjectRepository(RefreshToken)     private rtRepo: Repository<RefreshToken>,
    @InjectRepository(EmailVerification) private evRepo: Repository<EmailVerification>,
    @InjectRepository(PasswordReset)    private prRepo: Repository<PasswordReset>,
    private jwtService: JwtService,
    @Inject(SERVICES.NOTIFICATION) private notifClient: ClientProxy,
  ) {
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  async register(data: { name: string; email: string; password: string; meta: any }) {
    const exists = await this.userRepo.findOne({ where: { email: data.email } });
    if (exists) throw new ConflictException('Email sudah terdaftar');

    const passwordHash = await bcrypt.hash(data.password, this.SALT);
    const user = await this.userRepo.save(
      this.userRepo.create({ name: data.name, email: data.email, passwordHash, role: 'buyer' }),
    );

    const tokens = await this.generateTokens(user, data.meta);
    return { user: this.sanitize(user), tokens };
  }

  async login(data: { email: string; password: string; meta: any }) {
    const user = await this.userRepo
      .createQueryBuilder('u')
      .addSelect('u.passwordHash')
      .where('u.email = :email', { email: data.email })
      .getOne();

    if (!user) throw new UnauthorizedException('Email atau password salah');
    if (!user.isActive) throw new UnauthorizedException('Akun dinonaktifkan');

    const match = await bcrypt.compare(data.password, user.passwordHash);
    if (!match) throw new UnauthorizedException('Email atau password salah');

    if (user.role === 'seller' && !user.isEmailVerified)
      throw new UnauthorizedException('Email belum diverifikasi');

    const tokens = await this.generateTokens(user, data.meta);
    return { user: this.sanitize(user), tokens };
  }

  async googleLogin(data: { idToken: string; meta: any }) {
    if (!data.idToken) {
      throw new BadRequestException('ID Token Google diperlukan');
    }

    let payload;
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: data.idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (error: any) {
      throw new UnauthorizedException(`Token Google tidak valid atau kadaluarsa: ${error.message || error}. Backend Client ID: ${process.env.GOOGLE_CLIENT_ID}`);
    }

    if (!payload) {
      throw new UnauthorizedException('Gagal memproses data profil Google');
    }

    const { email, name, picture } = payload;
    if (!email) {
      throw new BadRequestException('Akun Google tidak menyediakan email');
    }

    let user = await this.userRepo.findOne({ where: { email } });

    if (!user) {
      const randomPassword = crypto.randomBytes(16).toString('hex');
      const passwordHash = await bcrypt.hash(randomPassword, this.SALT);
      
      user = await this.userRepo.save(
        this.userRepo.create({
          name: name || 'Google User',
          email,
          passwordHash,
          role: 'buyer',
          isEmailVerified: true,
          avatarUrl: picture || null,
        }),
      );
    } else {
      if (!user.avatarUrl && picture) {
        user.avatarUrl = picture;
        await this.userRepo.save(user);
      }
      
      if (!user.isActive) {
        throw new UnauthorizedException('Akun dinonaktifkan');
      }
    }

    const tokens = await this.generateTokens(user, data.meta);
    return { user: this.sanitize(user), tokens };
  }

  async refreshTokens(data: { refreshToken: string; sub: number; email: string; role: string; meta: any }) {
    const tokenHash = this.hash(data.refreshToken);
    const stored = await this.rtRepo.findOne({
      where: { tokenHash, isRevoked: false },
      relations: ['user'],
    });
    if (!stored || stored.expiresAt < new Date())
      throw new UnauthorizedException('Refresh token tidak valid');

    stored.isRevoked = true;
    await this.rtRepo.save(stored);
    return this.generateTokens(stored.user, data.meta);
  }

  async logout(userId: number, refreshToken: string) {
    const tokenHash = this.hash(refreshToken);
    await this.rtRepo.update({ userId, tokenHash }, { isRevoked: true });
    return { message: 'Berhasil logout' };
  }

  async logoutAll(userId: number) {
    await this.rtRepo.update({ userId, isRevoked: false }, { isRevoked: true });
    return { message: 'Logout semua perangkat' };
  }

  async sendVerificationOtp(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('User tidak ditemukan');
    if (user.isEmailVerified) throw new BadRequestException('Email sudah terverifikasi');

    await this.evRepo.update({ userId, isUsed: false }, { isUsed: true });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await this.evRepo.save(this.evRepo.create({ userId, token: otp, expiresAt }));

    // Kirim ke notification service
    this.notifClient.emit(NOTIFICATION_PATTERNS.SEND_OTP, { email: user.email, name: user.name, otp });
    return { message: 'OTP telah dikirim' };
  }

  async verifyEmail(userId: number, otp: string) {
    const ev = await this.evRepo.findOne({
      where: { userId, token: otp, isUsed: false, expiresAt: MoreThan(new Date()) },
    });
    if (!ev) throw new BadRequestException('OTP tidak valid atau kadaluarsa');
    ev.isUsed = true;
    await this.evRepo.save(ev);
    await this.userRepo.update(userId, { isEmailVerified: true });
    return { message: 'Email berhasil diverifikasi' };
  }

  async forgotPassword(email: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) return { message: 'Jika email terdaftar, link telah dikirim' };

    await this.prRepo.update({ userId: user.id, isUsed: false }, { isUsed: true });

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hash(rawToken);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    await this.prRepo.save(this.prRepo.create({ userId: user.id, tokenHash, expiresAt }));

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}`;
    this.notifClient.emit(NOTIFICATION_PATTERNS.SEND_RESET_LINK, { email: user.email, name: user.name, resetLink });
    return { message: 'Jika email terdaftar, link telah dikirim' };
  }

  async resetPassword(rawToken: string, newPassword: string) {
    const tokenHash = this.hash(rawToken);
    const record = await this.prRepo.findOne({
      where: { tokenHash, isUsed: false, expiresAt: MoreThan(new Date()) },
    });
    if (!record) throw new BadRequestException('Link tidak valid atau kadaluarsa');

    const passwordHash = await bcrypt.hash(newPassword, this.SALT);
    await this.userRepo.update(record.userId, { passwordHash });
    await this.rtRepo.update({ userId: record.userId, isRevoked: false }, { isRevoked: true });
    record.isUsed = true;
    await this.prRepo.save(record);
    return { message: 'Password berhasil direset' };
  }

  private async generateTokens(user: User, meta: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: requireSecret('JWT_ACCESS_SECRET'),
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: requireSecret('JWT_REFRESH_SECRET'),
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
      }),
    ]);

    const tokenHash = this.hash(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.rtRepo.save(this.rtRepo.create({
      userId: user.id, tokenHash, expiresAt,
      ipAddress: meta?.ip ?? null,
      userAgent: meta?.userAgent ?? null,
    }));

    return { accessToken, refreshToken };
  }

  private hash(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private sanitize(user: User) {
    const u = { ...user } as any;
    delete u.passwordHash;
    return u;
  }
}
