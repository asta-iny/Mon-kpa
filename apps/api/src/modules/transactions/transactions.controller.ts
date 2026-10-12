import { Router, type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import { getPrisma } from '../../infrastructure/prisma.js';
import { TransactionsService } from './transactions.service.js';
import {
  createTransactionSchema,
  updateTransactionSchema,
  transactionQuerySchema,
  publicIdSchema,
  transactionStatusSchema,
} from '@libfind/validation';

export function createTransactionsRouter(): Router {
  const router = Router();
  const prisma = getPrisma();
  const service = new TransactionsService(prisma);

  // --- Transactions ---
  router.post('/transactions', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createTransactionSchema.parse(req.body);
      const buyerId = req.actor!.userId;
      const transaction = await service.create(buyerId, parsed);
      res.status(201).json({ data: transaction });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: err.flatten(), requestId: req.requestId } });
      }
      next(err);
    }
  });

  router.get('/transactions', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = transactionQuerySchema.parse(req.query);
      const result = await service.getByBuyer(req.actor!.userId, parsed);
      res.status(200).json({ data: result.data, meta: { nextCursor: result.nextCursor } });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid query', details: err.flatten(), requestId: req.requestId } });
      }
      next(err);
    }
  });

  router.get('/transactions/seller', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = transactionQuerySchema.parse(req.query);
      const result = await service.getBySeller(req.actor!.userId, parsed);
      res.status(200).json({ data: result.data, meta: { nextCursor: result.nextCursor } });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid query', details: err.flatten(), requestId: req.requestId } });
      }
      next(err);
    }
  });

  router.get('/transactions/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = publicIdSchema.parse(req.params.id);
      const transaction = await service.getById(id);
      if (!transaction) {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Transaction not found', requestId: req.requestId } });
      }
      res.status(200).json({ data: transaction });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid ID', details: err.flatten(), requestId: req.requestId } });
      }
      next(err);
    }
  });

  router.patch('/transactions/:id/status', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = publicIdSchema.parse(req.params.id);
      const parsed = updateTransactionSchema.parse(req.body);
      const transaction = await service.getById(id);
      if (!transaction) {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Transaction not found', requestId: req.requestId } });
      }
      if (transaction.buyerId !== req.actor!.userId) {
        return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Not your transaction', requestId: req.requestId } });
      }
      const updated = await service.updateStatus(id, parsed.status);
      res.status(200).json({ data: updated });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: err.flatten(), requestId: req.requestId } });
      }
      next(err);
    }
  });

  router.post('/transactions/:id/cancel', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = publicIdSchema.parse(req.params.id);
      const transaction = await service.getById(id);
      if (!transaction) {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Transaction not found', requestId: req.requestId } });
      }
      if (transaction.buyerId !== req.actor!.userId) {
        return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Not your transaction', requestId: req.requestId } });
      }
      await service.cancel(id);
      res.status(204).send();
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: err.flatten(), requestId: req.requestId } });
      }
      next(err);
    }
  });

  router.post('/transactions/:id/refund', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = publicIdSchema.parse(req.params.id);
      const transaction = await service.getById(id);
      if (!transaction) {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Transaction not found', requestId: req.requestId } });
      }
      if (transaction.buyerId !== req.actor!.userId) {
        return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Not your transaction', requestId: req.requestId } });
      }
      await service.refund(id);
      res.status(204).send();
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: err.flatten(), requestId: req.requestId } });
      }
      next(err);
    }
  });

  // --- Transaction counts ---
  router.get('/transactions/counts/buyer', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const counts = await service.countByBuyer(req.actor!.userId);
      res.status(200).json({ data: counts });
    } catch (err) {
      next(err);
    }
  });

  router.get('/transactions/counts/seller', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const counts = await service.countBySeller(req.actor!.userId);
      res.status(200).json({ data: counts });
    } catch (err) {
      next(err);
    }
  });

  router.get('/transactions/counts/status', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const status = transactionStatusSchema.parse(req.query.status);
      const count = await service.countByStatus(status);
      res.status(200).json({ data: count });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid status filter', details: err.flatten(), requestId: req.requestId } });
      }
      next(err);
    }
  });

  return router;
}