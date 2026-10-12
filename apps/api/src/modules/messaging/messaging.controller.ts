import { Router, type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import { getPrisma } from '../../infrastructure/prisma.js';
import { MessagingService } from './messaging.service.js';
import {
  createMessageSchema,
  updateMessageSchema,
  messageQuerySchema,
  createMessageReportSchema,
  messageReportQuerySchema,
  publicIdSchema,
} from '@libfind/validation';

export function createMessagingRouter(): Router {
  const router = Router();
  const prisma = getPrisma();
  const service = new MessagingService(prisma);

  // --- Messages ---
  router.post('/messages', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createMessageSchema.parse(req.body);
      const recipientId = req.actor!.userId;
      const message = await service.create(recipientId, parsed);
      res.status(201).json({ data: message });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            details: err.flatten(),
            requestId: req.requestId,
          },
        });
      }
      next(err);
    }
  });

  router.get('/messages', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = messageQuerySchema.parse(req.query);
      const result = await service.getByRecipient(req.actor!.userId, parsed);
      res.status(200).json({ data: result.data, meta: { nextCursor: result.nextCursor } });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query',
            details: err.flatten(),
            requestId: req.requestId,
          },
        });
      }
      next(err);
    }
  });

  router.get('/messages/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = publicIdSchema.parse(req.params.id);
      const message = await service.getById(id);
      if (!message) {
        return res.status(404).json({
          error: { code: 'NOT_FOUND', message: 'Message not found', requestId: req.requestId },
        });
      }
      res.status(200).json({ data: message });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid ID',
            details: err.flatten(),
            requestId: req.requestId,
          },
        });
      }
      next(err);
    }
  });

  router.patch('/messages/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = publicIdSchema.parse(req.params.id);
      void updateMessageSchema.parse(req.body);
      const message = await service.getById(id);
      if (!message) {
        return res.status(404).json({
          error: { code: 'NOT_FOUND', message: 'Message not found', requestId: req.requestId },
        });
      }
      if (message.recipientId !== req.actor!.userId) {
        return res.status(403).json({
          error: { code: 'FORBIDDEN', message: 'Not your message', requestId: req.requestId },
        });
      }
      void await service.getById(id); // ownership already checked above
      res.status(200).json({ data: message });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            details: err.flatten(),
            requestId: req.requestId,
          },
        });
      }
      next(err);
    }
  });

  // --- Reports ---
  router.post('/reports', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createMessageReportSchema.parse(req.body);
      const reporterId = req.actor!.userId;
      const report = await service.createReport(reporterId, parsed);
      res.status(201).json({ data: report });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            details: err.flatten(),
            requestId: req.requestId,
          },
        });
      }
      next(err);
    }
  });

  router.get('/reports', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = messageReportQuerySchema.parse(req.query);
      const result = await service.listReports(parsed);
      res.status(200).json({ data: result.data, meta: { nextCursor: result.nextCursor } });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query',
            details: err.flatten(),
            requestId: req.requestId,
          },
        });
      }
      next(err);
    }
  });

  router.get('/reports/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = publicIdSchema.parse(req.params.id);
      const report = await service.getReport(id);
      if (!report) {
        return res.status(404).json({
          error: { code: 'NOT_FOUND', message: 'Report not found', requestId: req.requestId },
        });
      }
      res.status(200).json({ data: report });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid ID',
            details: err.flatten(),
            requestId: req.requestId,
          },
        });
      }
      next(err);
    }
  });

  return router;
}
