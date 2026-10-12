import { PrismaClient } from '@prisma/client';
import type { CreateReviewInput, UpdateReviewInput, ReviewQuery, ReviewStatus } from '@libfind/validation';

export class ReputationService {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(reviewerId: string, input: CreateReviewInput) {
    return this.prisma.review.create({
      data: {
        reviewerId,
        subjectId: input.subjectId,
        subjectType: input.subjectType,
        rating: input.rating,
        title: input.title,
        body: input.body,
        status: 'pending',
      },
      select: {
        id: true,
        reviewerId: true,
        subjectId: true,
        subjectType: true,
        rating: true,
        title: true,
        body: true,
        status: true,
        createdAt: true,
      },
    });
  }

  async getById(id: string) {
    return this.prisma.review.findUnique({
      where: { id },
      select: {
        id: true,
        reviewerId: true,
        subjectId: true,
        subjectType: true,
        rating: true,
        title: true,
        body: true,
        status: true,
        createdAt: true,
      },
    });
  }

  async getBySubject(subjectId: string, subjectType: string, query: ReviewQuery) {
    const { cursor, limit } = query;
    const where: Record<string, unknown> = { subjectId, subjectType };

    if (query.status) where.status = query.status;

    const reviews = await this.prisma.review.findMany({
      where,
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        reviewerId: true,
        subjectId: true,
        subjectType: true,
        rating: true,
        title: true,
        body: true,
        status: true,
        createdAt: true,
      },
    });

    let nextCursor: string | undefined;
    if (reviews.length > limit) {
      const next = reviews.pop();
      nextCursor = next?.id;
    }

    return { data: reviews, nextCursor };
  }

  async updateStatus(id: string, status: ReviewStatus) {
    return this.prisma.review.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        status: true,
      },
    });
  }

  // --- User reputation metrics ---

  async getUserReputation(userId: string) {
    // Get all approved reviews for this user (as subject)
    const [positiveReviews, totalReviews, averageRating] = await this.prisma.$transaction([
      this.prisma.review.count({ where: { subjectType: 'user', subjectId: userId, status: 'approved' } }),
      this.prisma.review.count({ where: { subjectType: 'user', subjectId: userId } }),
      this.prisma.review.aggregate({
        where: { subjectType: 'user', subjectId: userId, status: 'approved' },
        _avg: { rating: true },
      }),
    ]);

    // Calculate trust score based on reviews
    const trustScore = Math.min(100, Math.round((positiveReviews / Math.max(1, totalReviews)) * 100));

    return {
      userId,
      totalReviews,
      positiveReviews,
      averageRating: averageRating._avg.rating || 0,
      trustScore,
    };
  }

  // --- Listing reputation metrics ---

  async getListingReputation(listingId: string) {
    const [positiveReviews, totalReviews, averageRating] = await this.prisma.$transaction([
      this.prisma.review.count({ where: { subjectType: 'listing', subjectId: listingId, status: 'approved' } }),
      this.prisma.review.count({ where: { subjectType: 'listing', subjectId: listingId } }),
      this.prisma.review.aggregate({
        where: { subjectType: 'listing', subjectId: listingId, status: 'approved' },
        _avg: { rating: true },
      }),
    ]);

    const trustScore = Math.min(100, Math.round((positiveReviews / Math.max(1, totalReviews)) * 100));

    return {
      listingId,
      totalReviews,
      positiveReviews,
      averageRating: averageRating._avg.rating || 0,
      trustScore,
    };
  }

  // --- Transaction reputation metrics ---

  async getTransactionReputation(transactionId: string) {
    const [positiveReviews, totalReviews, averageRating] = await this.prisma.$transaction([
      this.prisma.review.count({ where: { subjectType: 'transaction', subjectId: transactionId, status: 'approved' } }),
      this.prisma.review.count({ where: { subjectType: 'transaction', subjectId: transactionId } }),
      this.prisma.review.aggregate({
        where: { subjectType: 'transaction', subjectId: transactionId, status: 'approved' },
        _avg: { rating: true },
      }),
    ]);

    const trustScore = Math.min(100, Math.round((positiveReviews / Math.max(1, totalReviews)) * 100));

    return {
      transactionId,
      totalReviews,
      positiveReviews,
      averageRating: averageRating._avg.rating || 0,
      trustScore,
    };
  }
}