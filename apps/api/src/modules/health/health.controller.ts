import { Router } from 'express';
import type { HealthResponse } from '@libfind/shared-types';
import { getPrisma } from '../../infrastructure/prisma.js';
import { pingRedis } from '../../infrastructure/redis.js';
import { metrics } from '../../infrastructure/metrics.js';

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

  router.get('/ready', async (req, res) => {
    let dbOk = false;
    let redisOk = false;
    try {
      await getPrisma().$queryRaw`SELECT 1`;
      dbOk = true;
    } catch {
      dbOk = false;
    }
    redisOk = await pingRedis();
    const ready = dbOk;
    res.status(ready ? 200 : 503).json({
      status: ready ? 'ready' : 'not_ready',
      checks: { database: dbOk, redis: redisOk },
      requestId: req.requestId,
      note: 'Readiness requires database; Redis is optional for degraded mode.',
    });
  });

  router.get('/metrics', (_req, res) => {
    res.setHeader('Content-Type', 'text/plain; version=0.0.4');
    res.status(200).send(metrics.toPrometheus());
  });

  return router;
}
