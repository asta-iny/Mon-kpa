import { z } from 'zod';
import {
  publicIdSchema,
  decimalAmountSchema,
  utcDateTimeSchema,
  cursorPaginationQuerySchema,
} from './base.js';

export const listingStatusSchema = z.enum([
  'draft',
  'active',
  'paused',
  'sold',
  'archived',
  'expired',
]);

export const createListingSchema = z.object({
  categoryId: publicIdSchema,
  countyId: publicIdSchema,
  districtId: publicIdSchema.optional(),
  communityId: publicIdSchema.optional(),
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(10000),
  priceAmount: decimalAmountSchema,
  priceCurrency: z.enum(['LRD', 'USD']),
  availableFrom: utcDateTimeSchema.optional(),
  availableUntil: utcDateTimeSchema.optional(),
});

export const updateListingSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).max(10000).optional(),
  priceAmount: decimalAmountSchema.optional(),
  priceCurrency: z.enum(['LRD', 'USD']).optional(),
  status: listingStatusSchema.optional(),
  availableFrom: utcDateTimeSchema.optional().nullable(),
  availableUntil: utcDateTimeSchema.optional().nullable(),
  districtId: publicIdSchema.optional().nullable(),
  communityId: publicIdSchema.optional().nullable(),
});

export const listingQuerySchema = cursorPaginationQuerySchema.extend({
  categoryId: publicIdSchema.optional(),
  countyId: publicIdSchema.optional(),
  districtId: publicIdSchema.optional(),
  communityId: publicIdSchema.optional(),
  status: listingStatusSchema.optional(),
  minPrice: decimalAmountSchema.optional(),
  maxPrice: decimalAmountSchema.optional(),
  availableFrom: utcDateTimeSchema.optional(),
  availableUntil: utcDateTimeSchema.optional(),
  q: z.string().min(1).max(200).optional(),
  sort: z.enum(['newest', 'oldest', 'price_asc', 'price_desc']).optional(),
});

export const transactionStatusSchema = z.enum([
  'pending',
  'confirmed',
  'completed',
  'cancelled',
  'refunded',
]);

export const createTransactionSchema = z.object({
  listingId: publicIdSchema,
  buyerId: publicIdSchema,
  sellerId: publicIdSchema,
  amount: decimalAmountSchema,
  currency: z.enum(['LRD', 'USD']),
  status: transactionStatusSchema.default('pending'),
  paymentMethod: z.string().optional(),
});

export const updateTransactionSchema = z.object({
  status: transactionStatusSchema.optional(),
  paymentMethod: z.string().optional(),
});

export const transactionQuerySchema = cursorPaginationQuerySchema.extend({
  listingId: publicIdSchema.optional(),
  buyerId: publicIdSchema.optional(),
  sellerId: publicIdSchema.optional(),
  status: transactionStatusSchema.optional(),
  cursor: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type TransactionQuery = z.infer<typeof transactionQuerySchema>;
export type TransactionStatus = z.infer<typeof transactionStatusSchema>;

export const reviewStatusSchema = z.enum(['pending', 'approved', 'rejected']);

export const createReviewSchema = z.object({
  subjectId: publicIdSchema,
  subjectType: z.enum(['user', 'listing', 'transaction']),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(1000),
});

export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().min(1).max(200).optional(),
  body: z.string().min(1).max(1000).optional(),
  status: reviewStatusSchema.optional(),
});

export const reviewQuerySchema = cursorPaginationQuerySchema.extend({
  subjectId: publicIdSchema.optional(),
  subjectType: z.enum(['user', 'listing', 'transaction']).optional(),
  status: reviewStatusSchema.optional(),
  cursor: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type ReviewQuery = z.infer<typeof reviewQuerySchema>;
export type ReviewStatus = z.infer<typeof reviewStatusSchema>;
