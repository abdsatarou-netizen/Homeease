import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  create(authorId: string, data: { targetId: string; propertyId?: string; bookingId?: string; rating: number; comment?: string }) {
    return this.prisma.review.create({ data: { authorId, ...data } });
  }

  async forTarget(targetId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { targetId },
      include: { author: { select: { profile: true } } },
      orderBy: { createdAt: 'desc' },
    });
    const average = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
    return { reviews, average: Math.round(average * 10) / 10, count: reviews.length };
  }

  forProperty(propertyId: string) {
    return this.prisma.review.findMany({
      where: { propertyId },
      include: { author: { select: { profile: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
