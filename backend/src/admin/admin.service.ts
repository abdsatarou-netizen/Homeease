import { Injectable } from '@nestjs/common';
import { ReportStatus, VerificationStatus, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async dashboard() {
    const [users, owners, properties, pendingProperties, bookings, payments, reports] =
      await this.prisma.$transaction([
        this.prisma.user.count(),
        this.prisma.user.count({ where: { role: Role.OWNER } }),
        this.prisma.property.count(),
        this.prisma.property.count({ where: { status: 'PENDING_REVIEW' } }),
        this.prisma.booking.count(),
        this.prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'SUCCESS' } }),
        this.prisma.report.count({ where: { status: 'PENDING' } }),
      ]);

    return {
      users,
      owners,
      properties,
      pendingProperties,
      bookings,
      totalRevenue: payments._sum.amount || 0,
      pendingReports: reports,
    };
  }

  // --- Signalements ---

  listReports(status?: ReportStatus) {
    return this.prisma.report.findMany({
      where: { status },
      include: { author: { select: { phone: true } }, property: { select: { title: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  updateReportStatus(id: string, status: ReportStatus) {
    return this.prisma.report.update({ where: { id }, data: { status } });
  }

  // --- Vérifications (téléphone / identité / pro / annonce) ---

  listVerifications(status?: VerificationStatus) {
    return this.prisma.verificationRequest.findMany({
      where: { status },
      include: { user: { select: { phone: true, profile: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async decideVerification(adminId: string, id: string, status: VerificationStatus) {
    const request = await this.prisma.verificationRequest.update({ where: { id }, data: { status } });

    if (status === VerificationStatus.APPROVED) {
      const field =
        request.type === 'IDENTITY'
          ? 'isIdentityVerified'
          : request.type === 'PROFESSIONAL'
          ? 'isProVerified'
          : request.type === 'PHONE'
          ? 'isPhoneVerified'
          : null;
      if (field) {
        await this.prisma.user.update({ where: { id: request.userId }, data: { [field]: true } });
      }
    }

    await this.prisma.adminAction.create({
      data: {
        adminId,
        action: `VERIFICATION_${status}`,
        targetType: 'VerificationRequest',
        targetId: id,
      },
    });

    return request;
  }

  // --- Paramètres (commissions, frais...) ---

  async getSettings() {
    const rows = await this.prisma.setting.findMany();
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  }

  async setSetting(key: string, value: string) {
    return this.prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
}
