import type { PrismaClient } from '@prisma/client';
import type {
  CreateTransactionInput,
  TransactionQuery,
  TransactionStatus,
} from '@libfind/validation';

export class TransactionsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(buyerId: string, input: CreateTransactionInput) {
    return this.prisma.transaction.create({
      data: {
        buyerId,
        sellerId: input.sellerId,
        listingId: input.listingId,
        amount: input.amount,
        currency: input.currency,
        status: input.status,
        paymentMethod: input.paymentMethod,
        transactionDate: new Date(),
      },
      select: {
        id: true,
        buyerId: true,
        sellerId: true,
        listingId: true,
        amount: true,
        currency: true,
        status: true,
        paymentMethod: true,
        transactionDate: true,
        completedAt: true,
        cancelledAt: true,
        refundedAt: true,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.transaction.findUnique({
      where: { id },
      select: {
        id: true,
        buyerId: true,
        sellerId: true,
        listingId: true,
        amount: true,
        currency: true,
        status: true,
        paymentMethod: true,
        transactionDate: true,
        completedAt: true,
        cancelledAt: true,
        refundedAt: true,
        listing: {
          select: {
            id: true,
            title: true,
            priceAmount: true,
            priceCurrency: true,
            status: true,
            ownerId: true,
          },
        },
      },
    });
  }

  async findByBuyer(buyerId: string, query: TransactionQuery) {
    const { cursor, limit } = query;
    const where: Record<string, unknown> = { buyerId };

    if (query.listingId) where.listingId = query.listingId;
    if (query.status) where.status = query.status;

    const transactions = await this.prisma.transaction.findMany({
      where,
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { transactionDate: 'desc' },
      select: {
        id: true,
        buyerId: true,
        sellerId: true,
        listingId: true,
        amount: true,
        currency: true,
        status: true,
        paymentMethod: true,
        transactionDate: true,
        completedAt: true,
        cancelledAt: true,
        refundedAt: true,
        listing: {
          select: {
            id: true,
            title: true,
            priceAmount: true,
            priceCurrency: true,
            status: true,
          },
        },
      },
    });

    let nextCursor: string | undefined;
    if (transactions.length > limit) {
      const next = transactions.pop();
      nextCursor = next?.id;
    }

    return { data: transactions, nextCursor };
  }

  async findBySeller(sellerId: string, query: TransactionQuery) {
    const { cursor, limit } = query;
    const where: Record<string, unknown> = { sellerId };

    if (query.listingId) where.listingId = query.listingId;
    if (query.status) where.status = query.status;

    const transactions = await this.prisma.transaction.findMany({
      where,
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { transactionDate: 'desc' },
      select: {
        id: true,
        buyerId: true,
        sellerId: true,
        listingId: true,
        amount: true,
        currency: true,
        status: true,
        paymentMethod: true,
        transactionDate: true,
        completedAt: true,
        cancelledAt: true,
        refundedAt: true,
        listing: {
          select: {
            id: true,
            title: true,
            priceAmount: true,
            priceCurrency: true,
            status: true,
          },
        },
      },
    });

    let nextCursor: string | undefined;
    if (transactions.length > limit) {
      const next = transactions.pop();
      nextCursor = next?.id;
    }

    return { data: transactions, nextCursor };
  }

  async updateStatus(id: string, status: TransactionStatus, completedAt?: Date) {
    const data: Record<string, unknown> = { status };
    if (completedAt) data.completedAt = completedAt;

    return this.prisma.transaction.update({
      where: { id },
      data,
      select: {
        id: true,
        status: true,
        completedAt: true,
      },
    });
  }

  async cancel(id: string, cancelledAt?: Date) {
    const data: Record<string, unknown> = { status: 'cancelled' };
    if (cancelledAt) data.cancelledAt = cancelledAt;

    return this.prisma.transaction.update({
      where: { id },
      data,
      select: {
        id: true,
        status: true,
        cancelledAt: true,
      },
    });
  }

  async refund(id: string, refundedAt?: Date) {
    const data: Record<string, unknown> = { status: 'refunded' };
    if (refundedAt) data.refundedAt = refundedAt;

    return this.prisma.transaction.update({
      where: { id },
      data,
      select: {
        id: true,
        status: true,
        refundedAt: true,
      },
    });
  }

  async countByBuyer(buyerId: string) {
    return this.prisma.transaction.count({ where: { buyerId } });
  }

  async countBySeller(sellerId: string) {
    return this.prisma.transaction.count({ where: { sellerId } });
  }

  async countByStatus(status: TransactionStatus) {
    return this.prisma.transaction.count({ where: { status } });
  }
}
