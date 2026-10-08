import { Router } from 'express';
import { getPrisma } from '../../infrastructure/prisma.js';

export function createCategoriesRouter(): Router {
  const router = Router();
  const prisma = getPrisma();

  router.get('/categories', async (_req, res, next) => {
    try {
      const categories = await prisma.category.findMany({
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        select: {
          id: true,
          code: true,
          name: true,
          parentId: true,
          sortOrder: true,
          isSynthetic: true,
        },
      });
      res.status(200).json({
        data: categories,
        meta: {
          note: 'Synthetic foundation registry for M0; Phase 1 expands product categories.',
        },
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
