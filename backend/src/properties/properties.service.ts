import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PropertyStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePropertyDto, SearchPropertiesDto, SortOption } from './dto/property.dto';

@Injectable()
export class PropertiesService {
  constructor(private prisma: PrismaService) {}

  async create(ownerId: string, dto: CreatePropertyDto) {
    const { imageUrls, city, commune, quarter, latitude, longitude, ...rest } = dto;

    return this.prisma.property.create({
      data: {
        ...rest,
        ownerId,
        status: PropertyStatus.PENDING_REVIEW,
        location: city
          ? { create: { city, commune, quarter, latitude, longitude } }
          : undefined,
        images: imageUrls?.length
          ? { create: imageUrls.map((url, i) => ({ url, sortOrder: i })) }
          : undefined,
      },
      include: { images: true, location: true, category: true },
    });
  }

  async search(dto: SearchPropertiesDto) {
    const page = dto.page || 1;
    const limit = Math.min(dto.limit || 20, 50);

    const where: Prisma.PropertyWhereInput = {
      status: PropertyStatus.PUBLISHED,
      category: dto.categorySlug ? { slug: dto.categorySlug } : undefined,
      location: {
        city: dto.city ? { equals: dto.city, mode: 'insensitive' } : undefined,
        commune: dto.commune ? { equals: dto.commune, mode: 'insensitive' } : undefined,
        quarter: dto.quarter ? { equals: dto.quarter, mode: 'insensitive' } : undefined,
      },
      price: {
        gte: dto.minPrice ?? undefined,
        lte: dto.maxPrice ?? undefined,
      },
      bedrooms: dto.bedrooms ?? undefined,
      rooms: dto.rooms ?? undefined,
      hasInternalShower: dto.hasInternalShower || undefined,
      hasInternalToilet: dto.hasInternalToilet || undefined,
      hasParking: dto.hasParking || undefined,
      hasWater: dto.hasWater || undefined,
      hasElectricity: dto.hasElectricity || undefined,
      hasWifi: dto.hasWifi || undefined,
      isFurnished: dto.isFurnished || undefined,
      isVerified: dto.verifiedOnly ? true : undefined,
      owner: dto.ownerVerifiedOnly ? { isProVerified: true } : undefined,
      OR: dto.query
        ? [
            { title: { contains: dto.query, mode: 'insensitive' } },
            { description: { contains: dto.query, mode: 'insensitive' } },
          ]
        : undefined,
    };

    const orderBy: Prisma.PropertyOrderByWithRelationInput =
      {
        [SortOption.RECENT]: { createdAt: 'desc' as const },
        [SortOption.PRICE_ASC]: { price: 'asc' as const },
        [SortOption.PRICE_DESC]: { price: 'desc' as const },
        [SortOption.POPULAR]: { viewsCount: 'desc' as const },
        [SortOption.RELEVANCE]: { isFeatured: 'desc' as const },
      }[dto.sort || SortOption.RELEVANCE] || { createdAt: 'desc' as const };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.property.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: { images: { take: 1, orderBy: { sortOrder: 'asc' } }, location: true, category: true, owner: { select: { isProVerified: true } } },
      }),
      this.prisma.property.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        videos: true,
        features: true,
        location: true,
        category: true,
        owner: {
          select: {
            id: true,
            isProVerified: true,
            isIdentityVerified: true,
            isSuperOwner: true,
            profile: true,
          },
        },
      },
    });
    if (!property) throw new NotFoundException('Annonce introuvable.');

    // Compteur de vues (best-effort, non bloquant)
    this.prisma.property.update({ where: { id }, data: { viewsCount: { increment: 1 } } }).catch(() => undefined);

    return property;
  }

  async findMineAsOwner(ownerId: string) {
    return this.prisma.property.findMany({
      where: { ownerId },
      include: { images: { take: 1 }, location: true, category: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(userId: string, userRole: string, id: string, data: Partial<CreatePropertyDto>) {
    const property = await this.prisma.property.findUnique({ where: { id } });
    if (!property) throw new NotFoundException('Annonce introuvable.');
    if (property.ownerId !== userId && !['ADMIN', 'SUPER_ADMIN', 'AGENT'].includes(userRole)) {
      throw new ForbiddenException("Vous n'êtes pas autorisé à modifier cette annonce.");
    }
    const { city, commune, quarter, latitude, longitude, imageUrls, ...rest } = data;
    return this.prisma.property.update({
      where: { id },
      data: { ...rest, status: PropertyStatus.PENDING_REVIEW },
    });
  }

  async remove(userId: string, userRole: string, id: string) {
    const property = await this.prisma.property.findUnique({ where: { id } });
    if (!property) throw new NotFoundException('Annonce introuvable.');
    if (property.ownerId !== userId && !['ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
      throw new ForbiddenException("Vous n'êtes pas autorisé à supprimer cette annonce.");
    }
    return this.prisma.property.update({ where: { id }, data: { status: PropertyStatus.ARCHIVED } });
  }

  // --- Administration ---

  findPendingReview() {
    return this.prisma.property.findMany({
      where: { status: PropertyStatus.PENDING_REVIEW },
      include: { images: { take: 1 }, owner: { select: { phone: true, profile: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  approve(id: string) {
    return this.prisma.property.update({ where: { id }, data: { status: PropertyStatus.PUBLISHED } });
  }

  reject(id: string) {
    return this.prisma.property.update({ where: { id }, data: { status: PropertyStatus.REJECTED } });
  }
}
