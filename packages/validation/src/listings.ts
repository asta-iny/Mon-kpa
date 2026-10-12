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
