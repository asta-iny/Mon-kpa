import { z } from 'zod';

/** Opaque public ID (UUID). Sequential DB IDs must never be exposed. */
export const publicIdSchema = z.string().uuid();

/** ISO-8601 UTC datetime string. */
export const utcDateTimeSchema = z.string().datetime({ offset: true });

/** Decimal money amount as a string (never float). */
export const decimalAmountSchema = z
  .string()
  .regex(/^-?\d+(\.\d{1,4})?$/, 'Amount must be a decimal string');

export const moneySchema = z.object({
  amount: decimalAmountSchema,
  currency: z.enum(['LRD', 'USD']),
});

/** Cursor pagination for public/high-volume collections. */
export const cursorPaginationQuerySchema = z.object({
  cursor: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const requestIdSchema = z.string().min(1);

export type MoneyInput = z.infer<typeof moneySchema>;
export type CursorPaginationQuery = z.infer<typeof cursorPaginationQuerySchema>;
