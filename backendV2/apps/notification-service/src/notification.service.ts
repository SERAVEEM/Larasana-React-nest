import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationService {
  private transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: false,
    auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
  });

  async sendVerificationOtp(email: string, name: string, otp: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: email,
        subject: 'LARASANA — Verifikasi Email Anda',
        html: `
          <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#0a0a0a;color:#ccc;padding:40px 32px;border:1px solid #222">
            <div style="text-align:center;margin-bottom:32px">
              <span style="font-family:Georgia,serif;font-size:28px;color:#c4a050;letter-spacing:4px">LARASANA</span>
            </div>
            <p>Halo, <strong style="color:#e8d5a0">${name}</strong></p>
            <p style="color:#666;line-height:1.7">Kode OTP Anda. Berlaku <strong style="color:#c4a050">10 menit</strong>.</p>
            <div style="text-align:center;margin:32px 0">
              <span style="font-size:36px;letter-spacing:12px;color:#c4a050;font-weight:bold;border:1px solid #333;padding:16px 32px;background:#111">${otp}</span>
            </div>
          </div>`,
      });
    } catch {
      throw new InternalServerErrorException('Gagal mengirim email OTP');
    }
  }

  async sendPasswordReset(email: string, name: string, resetLink: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: email,
        subject: 'LARASANA — Reset Password',
        html: `
          <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#0a0a0a;color:#ccc;padding:40px 32px;border:1px solid #222">
            <div style="text-align:center;margin-bottom:32px">
              <span style="font-family:Georgia,serif;font-size:28px;color:#c4a050;letter-spacing:4px">LARASANA</span>
            </div>
            <p>Halo, <strong style="color:#e8d5a0">${name}</strong></p>
            <p style="color:#666;line-height:1.7">Link reset password berlaku <strong style="color:#c4a050">30 menit</strong>.</p>
            <div style="text-align:center;margin:32px 0">
              <a href="${resetLink}" style="background:#c4a050;color:#0a0a0a;padding:14px 40px;text-decoration:none;font-size:13px;letter-spacing:2px;text-transform:uppercase;font-weight:bold">Reset Password</a>
            </div>
          </div>`,
      });
    } catch {
      throw new InternalServerErrorException('Gagal mengirim email reset password');
    }
  }
}
