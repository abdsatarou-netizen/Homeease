import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagingService {
  constructor(private prisma: PrismaService) {}

  async getOrCreateConversation(userId: string, otherUserId: string) {
    const existing = await this.prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId } } },
          { participants: { some: { userId: otherUserId } } },
        ],
      },
    });
    if (existing) return existing;

    return this.prisma.conversation.create({
      data: {
        participants: { create: [{ userId }, { userId: otherUserId }] },
      },
    });
  }

  listConversations(userId: string) {
    return this.prisma.conversation.findMany({
      where: { participants: { some: { userId } } },
      include: {
        participants: { include: { user: { select: { id: true, profile: true } } } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listMessages(userId: string, conversationId: string) {
    await this.ensureParticipant(userId, conversationId);
    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async sendMessage(userId: string, conversationId: string, content: string) {
    const participant = await this.ensureParticipant(userId, conversationId);
    if (participant.isBlocked) throw new ForbiddenException('Conversation bloquée.');

    return this.prisma.message.create({
      data: { conversationId, senderId: userId, content },
    });
  }

  async setBlocked(userId: string, conversationId: string, blocked: boolean) {
    const participant = await this.ensureParticipant(userId, conversationId);
    return this.prisma.conversationParticipant.update({
      where: { id: participant.id },
      data: { isBlocked: blocked },
    });
  }

  private async ensureParticipant(userId: string, conversationId: string) {
    const participant = await this.prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });
    if (!participant) throw new ForbiddenException("Vous ne faites pas partie de cette conversation.");
    return participant;
  }
}
