import { Router } from 'express';
import type { HealthResponse } from '@libfind/shared-types';

export function createHealthRouter(): Router {
  const router = Router();

  router.get('/health', (req, res) => {
    const body: HealthResponse = {
      status: 'ok',
      service: 'libfind-api',
      timestamp: new Date().toISOString(),
      requestId: req.requestId,
    };
    res.status(200).json(body);
  });

  return router;
}
