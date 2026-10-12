import { TransactionsRepository } from './transactions.repository.js';
import type { PrismaClient } from '@prisma/client';
import type {
  CreateTransactionInput,
  TransactionQuery,
  TransactionStatus,
} from '@libfind/validation';

export class TransactionsService {
  private readonly repo: TransactionsRepository;

  constructor(prisma: PrismaClient) {
    this.repo = new TransactionsRepository(prisma);
  }

  async create(buyerId: string, input: CreateTransactionInput) {
    return this.repo.create(buyerId, input);
  }

  async getById(id: string) {
    return this.repo.findById(id);
  }

  async getByBuyer(buyerId: string, query: TransactionQuery) {
    return this.repo.findByBuyer(buyerId, query);
  }

  async getBySeller(sellerId: string, query: TransactionQuery) {
    return this.repo.findBySeller(sellerId, query);
  }

  async updateStatus(id: string, status: TransactionStatus, completedAt?: Date) {
    return this.repo.updateStatus(id, status, completedAt);
  }

  async cancel(id: string, cancelledAt?: Date) {
    return this.repo.cancel(id, cancelledAt);
  }

  async refund(id: string, refundedAt?: Date) {
    return this.repo.refund(id, refundedAt);
  }

  async countByBuyer(buyerId: string) {
    return this.repo.countByBuyer(buyerId);
  }

  async countBySeller(sellerId: string) {
    return this.repo.countBySeller(sellerId);
  }

  async countByStatus(status: TransactionStatus) {
    return this.repo.countByStatus(status);
  }
}
