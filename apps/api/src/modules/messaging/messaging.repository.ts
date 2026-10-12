import type { PrismaClient } from '@prisma/client';
import type { CreateMessageInput, MessageQuery } from '@libfind/validation';

export class MessagingRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(recipientId: string, input: CreateMessageInput) {
    return this.prisma.message.create({
      data: {
        recipientId,
        content: input.content,
        type: input.type,
        metadata: input.metadata,
        status: 'sent',
      },
      select: {
        id: true,
        recipientId: true,
        content: true,
        type: true,
        status: true,
        createdAt: true,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.message.findUnique({
      where: { id },
      select: {
        id: true,
        recipientId: true,
        content: true,
        type: true,
        status: true,
        createdAt: true,
        read: true,
      },
    });
  }

  async findByRecipient(recipientId: string, query: MessageQuery) {
    const { cursor, limit } = query;
    const where: Record<string, unknown> = { recipientId };

    if (query.status) where.status = query.status;

    const messages = await this.prisma.message.findMany({
      where,
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        recipientId: true,
        content: true,
        type: true,
        status: true,
        createdAt: true,
        read: true,
      },
    });

    let nextCursor: string | undefined;
    if (messages.length > limit) {
      const next = messages.pop();
      nextCursor = next?.id;
    }

    return { data: messages, nextCursor };
  }

  async markAsRead(id: string) {
    return this.prisma.message.update({
      where: { id },
      data: { read: true },
      select: { id: true, read: true },
    });
  }
}
