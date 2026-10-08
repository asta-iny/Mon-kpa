import type { NextFunction, Request, Response } from 'express';
import { metrics } from '../infrastructure/metrics.js';

export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  res.on('finish', () => {
    metrics.observeRequest(res.statusCode, Date.now() - start);
  });
  next();
}
