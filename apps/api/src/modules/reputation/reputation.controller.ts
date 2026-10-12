import { Router, type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import { getPrisma } from '../../infrastructure/prisma.js';
import { ReputationService } from './reputation.service.js';
import {
  createReviewSchema,
  updateReviewSchema,
  reviewQuerySchema,
  publicIdSchema,
  reviewStatusSchema,
} from '@libfind/validation';

export function createReputationRouter(): Router {
  const router = Router();
  const prisma = getPrisma();
  const service = new ReputationService(prisma);

  // --- Reviews ---
  router.post('/reviews', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createReviewSchema.parse(req.body);
      const reviewerId = req.actor!.userId;
      const review = await service.create(reviewerId, parsed);
      res.status(201).json({ data: review });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: err.flatten(), requestId: req.requestId } });
      }
      next(err);
    }
  });

  router.get('/reviews', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = reviewQuerySchema.parse(req.query);
      const result = await service.getBySubject(req.actor!.userId, 'user', parsed);
      res.status(200).json({ data: result.data, meta: { nextCursor: result.nextCursor } });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid query', details: err.flatten(), requestId: req.requestId } });
      }
      next(err);
    }
  });

  router.get('/reviews/subject', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { subjectId, subjectType } = req.query;
      if (!subjectId || !subjectType) {
        return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'subjectId and subjectType required', requestId: req.requestId } });
      }
      const result = await service.getBySubject(subjectId, subjectType, parsed);
      res.status(200).json({ data: result.data, meta: { nextCursor: result.nextCursor } });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid query', details: err.flatten(), requestId: req.requestId } });
      }
      next(err);
    }
  });

  router.patch('/reviews/:id/status', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = publicIdSchema.parse(req.params.id);
      const parsed = reviewStatusSchema.parse(req.body);
      const review = await service.updateStatus(id, parsed.status);
      res.status(200).json({ data: review });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: err.flatten(), requestId: req.requestId } });
      }
      next(err);
    }
  });

  // --- User reputation ---
  router.get('/reputation/user', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reputation = await service.getUserReputation(req.actor!.userId);
      res.status(200).json({ data: reputation });
    } catch (err) {
      next(err);
    }
  });

  // --- Listing reputation ---
  router.get('/reputation/listing/:listingId', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reputation = await service.getListingReputation(req.params.listingId);
      res.status(200).json({ data: reputation });
    } catch (err) {
      next(err);
    }
  });

  // --- Transaction reputation ---
  router.get('/reputation/transaction/:transactionId', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reputation = await service.getTransactionReputation(req.params.transactionId);
      res.status(200).json({ data: reputation });
    } catch (err) {
      next(err);
    }
  });

  return router;
}