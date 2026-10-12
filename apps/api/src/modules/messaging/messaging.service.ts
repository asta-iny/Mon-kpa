import { MessagingRepository } from './messaging.repository.js';
import type { PrismaClient } from '@prisma/client';
import type { CreateMessageInput, CreateReportInput, MessageQuery, ReportQuery } from '@libfind/validation';

export class MessagingService {
  private readonly repo: MessagingRepository;
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.repo = new MessagingRepository(prisma);
  }

  async create(recipientId: string, input: CreateMessageInput) {
    return this.repo.create(recipientId, input);
  }

  async getById(id: string) {
    return this.repo.findById(id);
  }

  async getByRecipient(recipientId: string, query: MessageQuery) {
    return this.repo.findByRecipient(recipientId, query);
  }

  async markAsRead(id: string) {
    return this.repo.markAsRead(id);
  }

  // --- Reports ---
  async createReport(reporterId: string, input: CreateReportInput) {
    return this.prisma.report.create({
      data: {
        reporterId,
        subjectType: input.subjectType,
        subjectId: input.subjectId,
        reason: input.reason,
        detail: input.detail,
        status: 'open',
      },
      select: {
        id: true,
        subjectType: true,
        subjectId: true,
        reason: true,
        status: true,
        createdAt: true,
      },
    });
  }

  async listReports(query: ReportQuery) {
    const { cursor, limit, ...filters } = query;
    const where: Record<string, unknown> = {};
    if (filters.subjectType) where.subjectType = filters.subjectType;
    if (filters.subjectId) where.subjectId = filters.subjectId;
    if (filters.reason) where.reason = filters.reason;
    if (filters.status) where.status = filters.status;

    const reports = await this.prisma.report.findMany({
      where,
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        subjectType: true,
        subjectId: true,
        reason: true,
        status: true,
        createdAt: true,
      },
    });

    let nextCursor: string | undefined;
    if (reports.length > limit) {
      const next = reports.pop();
      nextCursor = next?.id;
    }
    return { data: reports, nextCursor };
  }
}