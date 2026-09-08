import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

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

  async register(firstName: string, lastName: string, email: string, password: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Un compte existe déjà avec cet email.');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        profile: { create: { firstName, lastName } },
      },
      include: { profile: true },
    });

    const token = this.jwt.sign({ sub: user.id, phone: user.phone, role: user.role });
    return {
      accessToken: token,
      user: { id: user.id, email: user.email, role: user.role, profile: user.profile },
    };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email }, include: { profile: true } });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Email ou mot de passe incorrect.');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect.');
    }

    if (user.isBanned) throw new UnauthorizedException('Ce compte a été banni.');
    if (user.isSuspended) throw new UnauthorizedException('Ce compte est suspendu.');

    const token = this.jwt.sign({ sub: user.id, phone: user.phone, role: user.role });
    return {
      accessToken: token,
      user: { id: user.id, email: user.email, role: user.role, profile: user.profile },
    };
  }

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
