import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { getEnv } from './config/env.js';
import { createLogger } from './infrastructure/logger.js';
import { createErrorHandler, notFoundHandler } from './middleware/error-handler.js';
import { requestIdMiddleware } from './middleware/request-id.js';
import { createHealthRouter } from './modules/health/health.controller.js';

export function createApp() {
  const env = getEnv();
  const logger = createLogger();
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(requestIdMiddleware);

  app.use((req, _res, next) => {
    logger.info(
      {
        requestId: req.requestId,
        method: req.method,
        path: req.path,
      },
      'request',
    );
    next();
  });

  // REST base path per ADR-005 / engineering contract
  app.use('/api/v1', createHealthRouter());

  app.use(notFoundHandler);
  app.use(createErrorHandler(logger));

  return { app, logger, env };
}
