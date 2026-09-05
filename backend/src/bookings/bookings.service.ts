import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  // Les commissions/frais sont configurables via la table `Setting`
  // (jamais codés en dur), modifiables depuis l'espace admin (module settings à venir).
  private async getPercentSetting(key: string, fallback: number): Promise<number> {
    const row = await this.prisma.setting.findUnique({ where: { key } });
    return row ? Number(row.value) : fallback;
  }

  async create(clientId: string, propertyId: string, startDate: string, endDate?: string, guestsCount?: number) {
    const property = await this.prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) throw new NotFoundException('Annonce introuvable.');

    const basePrice = Number(property.price);
    const feePercent = await this.getPercentSetting('booking_fee_percent', 0);
    const commissionPercent = await this.getPercentSetting('commission_percent', 5);

    const fees = Math.round(basePrice * (feePercent / 100));
    const commission = Math.round(basePrice * (commissionPercent / 100));
    const totalPrice = basePrice + fees + commission;

    const booking = await this.prisma.booking.create({
      data: {
        propertyId,
        clientId,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : undefined,
        guestsCount,
        basePrice,
        fees,
        commission,
        totalPrice,
      },
    });

    await this.prisma.notification.create({
      data: {
        userId: property.ownerId,
        type: 'BOOKING',
        title: 'Nouvelle réservation',
        body: `Une réservation a été effectuée pour votre annonce.`,
      },
    });

    return booking;
  }

  listForClient(clientId: string) {
    return this.prisma.booking.findMany({
      where: { clientId },
      include: { property: { include: { images: { take: 1 } } }, payments: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  listForOwner(ownerId: string) {
    return this.prisma.booking.findMany({
      where: { property: { ownerId } },
      include: { property: { include: { images: { take: 1 } } }, client: { select: { phone: true, profile: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(actingUserId: string, actingRole: string, id: string, status: BookingStatus) {
    const booking = await this.prisma.booking.findUnique({ where: { id }, include: { property: true } });
    if (!booking) throw new NotFoundException('Réservation introuvable.');

    const isOwner = booking.property.ownerId === actingUserId;
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(actingRole);
    const isClient = booking.clientId === actingUserId;

    if (status === BookingStatus.CANCELLED && !isClient && !isOwner && !isAdmin) {
      throw new ForbiddenException('Non autorisé.');
    }
    const restrictedStatuses: BookingStatus[] = [BookingStatus.ACCEPTED, BookingStatus.REJECTED];
    if (restrictedStatuses.includes(status) && !isOwner && !isAdmin) {
      throw new ForbiddenException('Seul le propriétaire peut accepter/refuser.');
    }

    return this.prisma.booking.update({ where: { id }, data: { status } });
  }
}
