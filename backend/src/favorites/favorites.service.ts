import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId },
      include: { property: { include: { images: { take: 1 }, location: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async toggle(userId: string, propertyId: string) {
    const existing = await this.prisma.favorite.findUnique({
      where: { userId_propertyId: { userId, propertyId } },
    });
    if (existing) {
      await this.prisma.favorite.delete({ where: { id: existing.id } });
      return { favorited: false };
    }
    await this.prisma.favorite.create({ data: { userId, propertyId } });
    return { favorited: true };
  }
}
