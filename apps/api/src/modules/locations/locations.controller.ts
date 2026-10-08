import { Router } from 'express';
import { getPrisma } from '../../infrastructure/prisma.js';

export function createLocationsRouter(): Router {
  const router = Router();
  const prisma = getPrisma();

  router.get('/locations/counties', async (_req, res, next) => {
    try {
      const counties = await prisma.county.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, code: true, name: true },
      });
      res.status(200).json({
        data: counties,
        meta: {
          count: counties.length,
          note: 'District/community gazetteer rows are OPEN — counties only for M0.',
        },
      });
    } catch (err) {
      next(err);
    }
  });

  router.get('/locations/counties/:code', async (req, res, next) => {
    try {
      const county = await prisma.county.findUnique({
        where: { code: req.params.code },
        include: {
          districts: {
            include: { communities: true },
          },
        },
      });
      if (!county) {
        res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'County not found',
            requestId: req.requestId,
          },
        });
        return;
      }
      res.status(200).json({ data: county });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
