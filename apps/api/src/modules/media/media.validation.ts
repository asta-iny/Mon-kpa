import { z } from 'zod';

export const mediaMetadataSchema = z.object({
  cloudinaryPublicId: z.string().min(1).max(255),
  resourceType: z.enum(['image', 'video', 'raw']).default('image'),
  format: z.string().max(32).optional(),
  bytes: z.number().int().positive().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  secureUrl: z.string().url().max(512).optional(),
});

export type MediaMetadataInput = z.infer<typeof mediaMetadataSchema>;
