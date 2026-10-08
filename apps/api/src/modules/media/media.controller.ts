import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { getPrisma } from '../../infrastructure/prisma.js';
import { requireAuth, requirePermission } from '../../middleware/auth.js';
import { AppError } from '../../middleware/error-handler.js';
import { CloudinaryMediaProvider, shouldRetryCleanup } from './cloudinary.adapter.js';
import { MediaProviderError } from './cloudinary.errors.js';
import { mediaMetadataSchema } from './media.validation.js';

export function createMediaRouter(): Router {
  const router = Router();
  const prisma = getPrisma();
  const provider = new CloudinaryMediaProvider();

  router.get('/media/foundation', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      module: 'media',
      cloudinaryConfigured: provider.isConfigured(),
      note: 'API secret never leaves the server.',
    });
  });

  router.post(
    '/media/sign-upload',
    requireAuth,
    requirePermission('media:upload:sign'),
    (req, res, next) => {
      try {
        if (!provider.isConfigured()) {
          throw new AppError({
            statusCode: 503,
            code: 'INTERNAL_ERROR',
            message: 'Cloudinary is not configured',
            expose: true,
          });
        }
        const folder = `libfind/${req.actor!.userId}`;
        const signed = provider.createSignedUpload(folder);
        res.status(200).json({
          data: signed,
          // Explicitly do not include api_secret
        });
      } catch (err) {
        if (err instanceof MediaProviderError && err.kind === 'not_configured') {
          next(
            new AppError({
              statusCode: 503,
              code: 'INTERNAL_ERROR',
              message: 'Cloudinary is not configured',
              expose: true,
            }),
          );
          return;
        }
        next(err);
      }
    },
  );

  router.post(
    '/media/metadata',
    requireAuth,
    requirePermission('media:metadata:write'),
    async (req, res, next) => {
      try {
        const parsed = mediaMetadataSchema.safeParse(req.body);
        if (!parsed.success) {
          throw new AppError({
            statusCode: 400,
            code: 'VALIDATION_ERROR',
            message: 'Invalid media metadata',
            details: parsed.error.flatten(),
          });
        }
        const data = parsed.data;
        const asset = await prisma.mediaAsset.create({
          data: {
            id: randomUUID(),
            ownerId: req.actor!.userId,
            cloudinaryPublicId: data.cloudinaryPublicId,
            resourceType: data.resourceType,
            ...(data.format !== undefined ? { format: data.format } : {}),
            ...(data.bytes !== undefined ? { bytes: data.bytes } : {}),
            ...(data.width !== undefined ? { width: data.width } : {}),
            ...(data.height !== undefined ? { height: data.height } : {}),
            ...(data.secureUrl !== undefined ? { secureUrl: data.secureUrl } : {}),
          },
        });
        res.status(201).json({ data: asset });
      } catch (err) {
        next(err);
      }
    },
  );

  router.post(
    '/media/cleanup',
    requireAuth,
    requirePermission('admin:manage'),
    async (req, res, next) => {
      try {
        const publicId = String(req.body?.publicId ?? '');
        const attempt = Number(req.body?.attempt ?? 1);
        const maxAttempts = Number(req.body?.maxAttempts ?? 3);
        try {
          const result = await provider.deleteByPublicId(publicId);
          await prisma.mediaAsset.updateMany({
            where: { cloudinaryPublicId: publicId },
            data: { status: 'deleted', deletedAt: new Date() },
          });
          res.status(200).json({ data: result });
        } catch (err) {
          if (err instanceof MediaProviderError) {
            const retry = shouldRetryCleanup(err, { publicId, attempt, maxAttempts });
            res.status(retry ? 503 : 400).json({
              error: {
                code: retry ? 'INTERNAL_ERROR' : 'BAD_REQUEST',
                message: err.message,
                requestId: req.requestId,
                details: { kind: err.kind, retry },
              },
            });
            return;
          }
          throw err;
        }
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
}
