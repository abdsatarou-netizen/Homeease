import { Injectable, NotFoundException } from '@nestjs/common';
import { PaymentProvider, PaymentStatus } from '@prisma/client';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

// -----------------------------------------------------------------------
// NOTE IMPORTANTE : ce module prépare l'architecture de paiement pour le
// marché béninois (Kkiapay, MTN MoMo). Il ne stocke JAMAIS de données de
// carte : seules les références transmises par le prestataire sont
// conservées. Pour activer un vrai paiement :
//   1. Appeler l'API du prestataire (Kkiapay/MoMo) avec KKIAPAY_PRIVATE_KEY
//      ou MTN_MOMO_* (voir .env.example) pour obtenir un lien/QR de paiement.
//   2. Le prestataire notifie HomeEase via webhook -> confirmPayment().
// En attendant cette intégration réelle, initiate() crée un paiement PENDING
// avec une référence unique, prêt à être branché.
// -----------------------------------------------------------------------

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async initiate(userId: string, bookingId: string, amount: number, provider: PaymentProvider) {
    const reference = `HE-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    return this.prisma.payment.create({
      data: {
        userId,
        bookingId,
        amount,
        provider,
        transactionReference: reference,
        status: PaymentStatus.PENDING,
      },
    });
  }

  listMine(userId: string) {
    return this.prisma.payment.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  // Appelé par le webhook du prestataire de paiement (à sécuriser par signature
  // dans une prochaine itération, spécifique à chaque prestataire).
  async confirmByReference(transactionReference: string, status: PaymentStatus) {
    const payment = await this.prisma.payment.findUnique({ where: { transactionReference } });
    if (!payment) throw new NotFoundException('Paiement introuvable.');

    const updated = await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status },
    });

    if (status === PaymentStatus.SUCCESS && payment.bookingId) {
      await this.prisma.booking.update({ where: { id: payment.bookingId }, data: { status: 'ACCEPTED' } });
    }

    return updated;
  }

  // --- Administration ---

  listAll() {
    return this.prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { phone: true } } },
    });
  }
}
