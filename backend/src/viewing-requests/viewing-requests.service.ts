import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ViewingRequestStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ViewingRequestsService {
  constructor(private prisma: PrismaService) {}

  async create(clientId: string, propertyId: string, requestedDate: string, message?: string) {
    const property = await this.prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) throw new NotFoundException('Annonce introuvable.');

    const request = await this.prisma.viewingRequest.create({
      data: { clientId, propertyId, requestedDate: new Date(requestedDate), message },
    });

    await this.prisma.notification.create({
      data: {
        userId: property.ownerId,
        type: 'VIEWING_REQUEST',
        title: 'Nouvelle demande de visite',
        body: `Une demande de visite a été faite pour votre annonce.`,
      },
    });

    return request;
  }

  listForClient(clientId: string) {
    return this.prisma.viewingRequest.findMany({
      where: { clientId },
      include: { property: { include: { images: { take: 1 } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  listForOwner(ownerId: string) {
    return this.prisma.viewingRequest.findMany({
      where: { property: { ownerId } },
      include: { property: { include: { images: { take: 1 } } }, client: { select: { phone: true, profile: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async respond(ownerId: string, id: string, status: ViewingRequestStatus) {
    const request = await this.prisma.viewingRequest.findUnique({
      where: { id },
      include: { property: true },
    });
    if (!request) throw new NotFoundException('Demande introuvable.');
    if (request.property.ownerId !== ownerId) {
      throw new ForbiddenException("Vous n'êtes pas le propriétaire de cette annonce.");
    }

    const updated = await this.prisma.viewingRequest.update({ where: { id }, data: { status } });

    await this.prisma.notification.create({
      data: {
        userId: request.clientId,
        type: 'VIEWING_REQUEST_UPDATE',
        title: status === 'ACCEPTED' ? 'Demande de visite acceptée' : 'Demande de visite refusée',
      },
    });

    return updated;
  }
}
