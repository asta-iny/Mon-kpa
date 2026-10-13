import { createSpikeRouter } from './modules/spike/ssr-search.js';
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
import { createReputationRouter } from './modules/reputation/reputation.controller.js';
import { createListingsRouter } from './modules/listings/listings.controller.js';
import { createSearchRouter } from './modules/search/search.controller.js';
import { createTrustRouter } from './modules/trust/trust.controller.js';
import { requireAuth } from './middleware/auth.js';

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

  // Listings: public read, protected write
  const listingsRouter = createListingsRouter();
  app.use(
    '/api/v1/listings',
    (req, res, next) => {
      const publicPaths = ['/'];
      const publicMethods = ['GET'];
      const isPublic = publicPaths.includes(req.path) && publicMethods.includes(req.method);
      if (isPublic) return next();
      requireAuth(req, res, next);
    },
    listingsRouter,
  );
  app.use('/api/v1/listings/mine', requireAuth, listingsRouter);
  app.use(
    '/api/v1/listings/:id',
    (req, res, next) => {
      if (req.method === 'GET') return next();
      requireAuth(req, res, next);
    },
    listingsRouter,
  );

  const searchRouter = createSearchRouter();
  app.use('/api/v1/search', searchRouter);
  app.use('/api/v1/reputation', createReputationRouter());
  app.use('/api/v1/search/facets', searchRouter);

  // Trust/Safety: protected endpoints
  const trustRouter = createTrustRouter();
  app.use('/api/v1/verifications', requireAuth, trustRouter);
  app.use('/api/v1/reports', requireAuth, trustRouter);
  app.use('/api/v1/moderation-actions', requireAuth, trustRouter);

  app.use(notFoundHandler);
  app.use(createErrorHandler(logger));

  return { app, logger, env };
}

