import { z } from 'zod';
import { publicIdSchema } from './base.js';

/** Message types for in-app messaging */
export const messageTypeSchema = z.enum(['text', 'image', 'system']);

export const messageStatusSchema = z.enum(['sent', 'delivered', 'read', 'archived']);

export const createMessageSchema = z.object({
  recipientId: publicIdSchema,
  content: z.string().min(1).max(5000),
  type: messageTypeSchema.default('text'),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateMessageSchema = z.object({
  content: z.string().min(1).max(5000).optional(),
  status: messageStatusSchema.optional(),
});

export const messageQuerySchema = z.object({
  recipientId: publicIdSchema.optional(),
  status: messageStatusSchema.optional(),
  cursor: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type UpdateMessageInput = z.infer<typeof updateMessageSchema>;
export type MessageQuery = z.infer<typeof messageQuerySchema>;

/** Review/report types */
export const reportReasonSchema = z.enum(['spam', 'harassment', 'fraud', 'inappropriate', 'other']);

export const reportStatusSchema = z.enum(['open', 'under_review', 'resolved', 'dismissed']);

export const createReportSchema = z.object({
  subjectType: z.enum(['user', 'listing', 'message']),
  subjectId: publicIdSchema,
  reason: reportReasonSchema,
  detail: z.string().max(1000).optional(),
});

export const reportQuerySchema = z.object({
  subjectType: z.enum(['user', 'listing', 'message']).optional(),
  subjectId: publicIdSchema.optional(),
  reason: reportReasonSchema.optional(),
  status: reportStatusSchema.optional(),
  cursor: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateMessageReportInput = z.infer<typeof createReportSchema>;
export type MessageReportQuery = z.infer<typeof reportQuerySchema>;
