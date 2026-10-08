import type { NextFunction, Request, Response } from 'express';
import { getPrisma } from '../infrastructure/prisma.js';
import { AppError } from './error-handler.js';
import type { AuthActor } from '../modules/auth/session.service.js';
import { SessionService } from '../modules/auth/session.service.js';

declare module 'express-serve-static-core' {
  interface Request {
    actor?: AuthActor;
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    const header = req.header('authorization');
    if (!header?.startsWith('Bearer ')) {
      throw new AppError({
        statusCode: 401,
        code: 'UNAUTHORIZED',
        message: 'Bearer access token required',
      });
    }
    const token = header.slice('Bearer '.length).trim();
    const sessions = new SessionService(getPrisma());
    req.actor = sessions.verifyAccessToken(token);
    next();
  } catch (err) {
    next(err);
  }
}

export function requirePermission(...codes: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (!req.actor) {
        throw new AppError({
          statusCode: 401,
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        });
      }
      const missing = codes.filter((c) => !req.actor!.permissions.includes(c));
      if (missing.length > 0) {
        throw new AppError({
          statusCode: 403,
          code: 'FORBIDDEN',
          message: 'Missing required permission',
          details: { missing },
        });
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}
