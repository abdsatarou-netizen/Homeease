import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id }, include: { profile: true } });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.profile.update({ where: { userId }, data: dto });
  }

  // --- Administration ---

  listAll(params: { role?: Role; search?: string }) {
    return this.prisma.user.findMany({
      where: {
        role: params.role,
        OR: params.search
          ? [
              { phone: { contains: params.search } },
              { email: { contains: params.search, mode: 'insensitive' } },
            ]
          : undefined,
      },
      include: { profile: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async setSuspended(id: string, suspended: boolean) {
    await this.ensureExists(id);
    return this.prisma.user.update({ where: { id }, data: { isSuspended: suspended } });
  }

  async setBanned(id: string, banned: boolean) {
    await this.ensureExists(id);
    return this.prisma.user.update({ where: { id }, data: { isBanned: banned } });
  }

  async setRole(actingRole: Role, id: string, role: Role) {
    if (actingRole !== Role.SUPER_ADMIN) {
      throw new ForbiddenException('Seul un SUPER_ADMIN peut modifier les rôles.');
    }
    await this.ensureExists(id);
    return this.prisma.user.update({ where: { id }, data: { role } });
  }

  private async ensureExists(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur introuvable.');
  }
}
