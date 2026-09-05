import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

// Fournisseur SMS : en mode "mock" (par défaut en dev), le code est simplement
// journalisé côté serveur au lieu d'être envoyé par SMS. À remplacer par un
// vrai fournisseur (agrégateur local béninois, Twilio, Vonage...) en branchant
// SMS_PROVIDER dans .env — le reste du flux OTP ne change pas.
async function sendSms(phone: string, message: string) {
  if ((process.env.SMS_PROVIDER || 'mock') === 'mock') {
    // eslint-disable-next-line no-console
    console.log(`[SMS MOCK] à ${phone} : ${message}`);
    return;
  }
  throw new Error(`Fournisseur SMS "${process.env.SMS_PROVIDER}" non implémenté.`);
}

function hashCode(code: string) {
  return crypto.createHash('sha256').update(code).digest('hex');
}

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async requestOtp(phone: string) {
    const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
    const expiresMinutes = Number(process.env.OTP_EXPIRES_IN_MINUTES || 5);
    const expiresAt = new Date(Date.now() + expiresMinutes * 60 * 1000);

    await this.prisma.otpCode.create({
      data: { phone, codeHash: hashCode(code), expiresAt },
    });

    await sendSms(phone, `Votre code HomeEase : ${code} (valable ${expiresMinutes} min).`);

    return { message: 'Code envoyé.', expiresInMinutes: expiresMinutes };
  }

  async verifyOtp(phone: string, code: string) {
    const otp = await this.prisma.otpCode.findFirst({
      where: { phone, consumed: false },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp || otp.expiresAt < new Date() || otp.codeHash !== hashCode(code)) {
      throw new UnauthorizedException('Code invalide ou expiré.');
    }

    await this.prisma.otpCode.update({ where: { id: otp.id }, data: { consumed: true } });

    let user = await this.prisma.user.findUnique({ where: { phone } });
    if (!user) {
      user = await this.prisma.user.create({
        data: { phone, isPhoneVerified: true, profile: { create: {} } },
      });
    } else if (!user.isPhoneVerified) {
      user = await this.prisma.user.update({ where: { id: user.id }, data: { isPhoneVerified: true } });
    }

    if (user.isBanned) throw new UnauthorizedException('Ce compte a été banni.');
    if (user.isSuspended) throw new UnauthorizedException('Ce compte est suspendu.');

    const token = this.jwt.sign({ sub: user.id, phone: user.phone, role: user.role });
    return { accessToken: token, user: { id: user.id, phone: user.phone, role: user.role } };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
    if (!user) throw new BadRequestException('Utilisateur introuvable.');
    return user;
  }
}
