import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { getEnv } from './config/env.js';
import { createLogger } from './infrastructure/logger.js';
import { createErrorHandler, notFoundHandler } from './middleware/error-handler.js';
import { requestIdMiddleware } from './middleware/request-id.js';
import { metricsMiddleware } from './middleware/metrics.js';
import { createHealthRouter } from './modules/health/health.controller.js';
import { createAuthRouter } from './modules/auth/auth.controller.js';
import { createLocationsRouter } from './modules/locations/locations.controller.js';
import { createCategoriesRouter } from './modules/categories/categories.controller.js';
import { createMediaRouter } from './modules/media/media.controller.js';
import { createSpikeRouter } from './modules/spike/ssr-search.js';

export function createApp() {
  const env = getEnv();
  const logger = createLogger();
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(requestIdMiddleware);
  app.use(metricsMiddleware);

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
  app.use('/api/v1', createAuthRouter());
  app.use('/api/v1', createLocationsRouter());
  app.use('/api/v1', createCategoriesRouter());
  app.use('/api/v1', createMediaRouter());
  app.use('/api/v1', createSpikeRouter());

  app.use(notFoundHandler);
  app.use(createErrorHandler(logger));

  return { app, logger, env };
}
