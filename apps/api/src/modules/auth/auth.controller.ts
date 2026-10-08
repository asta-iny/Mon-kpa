import { Router } from 'express';
import { getEnv } from '../../config/env.js';
import { getPrisma } from '../../infrastructure/prisma.js';
import { AppError } from '../../middleware/error-handler.js';
import { requireAuth } from '../../middleware/auth.js';
import { AuditService } from '../audit/audit.service.js';
import { OtpService } from './otp.service.js';
import { SessionService } from './session.service.js';

/**
 * Auth foundation routes (M0).
 * SMS delivery is Phase 1 — local/test may expose OTP codes only when APP_ENV is local|test.
 */
export function createAuthRouter(): Router {
  const router = Router();
  const prisma = getPrisma();
  const otp = new OtpService(prisma);
  const sessions = new SessionService(prisma);
  const audit = new AuditService(prisma);

  router.get('/auth/foundation', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      module: 'auth',
      phase: 'M0-skeleton',
      smsProvider: 'not-wired',
    });
  });

  router.post('/auth/otp/request', async (req, res, next) => {
    try {
      const phone = String(req.body?.phone ?? '');
      const env = getEnv();
      const expose = env.APP_ENV === 'local' || env.APP_ENV === 'test' ? true : false;
      const deviceId = req.header('x-device-id');
      const result = await otp.createChallenge({
        phone,
        exposeCodeForLocal: expose,
        ...(req.ip ? { ip: req.ip } : {}),
        ...(deviceId ? { deviceId } : {}),
      });
      res.status(201).json({
        challengeId: result.challengeId,
        expiresAt: result.expiresAt.toISOString(),
        ...(result.code
          ? { code: result.code, warning: 'local/test only — not for production' }
          : {}),
      });
    } catch (err) {
      next(err);
    }
  });

  router.post('/auth/otp/verify', async (req, res, next) => {
    try {
      const challengeId = String(req.body?.challengeId ?? '');
      const code = String(req.body?.code ?? '');
      const { phoneE164 } = await otp.verifyAndConsume({ challengeId, code });

      let user = await prisma.user.findUnique({ where: { phoneE164 } });
      if (!user) {
        const { randomUUID } = await import('node:crypto');
        user = await prisma.user.create({
          data: {
            id: randomUUID(),
            phoneE164,
            status: 'active',
          },
        });
        const role = await prisma.role.findUnique({ where: { code: 'user' } });
        if (role) {
          await prisma.userRole.create({
            data: { userId: user.id, roleId: role.id },
          });
        }
      }

      const tokens = await sessions.issueSession(user.id);
      await audit.append({
        actorId: user.id,
        action: 'auth.otp.verify',
        resourceType: 'session',
        resourceId: tokens.sessionId,
        requestId: req.requestId,
      });

      res.status(200).json({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenType: 'Bearer',
      });
    } catch (err) {
      next(err);
    }
  });

  router.post('/auth/token/refresh', async (req, res, next) => {
    try {
      const refreshToken = String(req.body?.refreshToken ?? '');
      if (!refreshToken) {
        throw new AppError({
          statusCode: 400,
          code: 'BAD_REQUEST',
          message: 'refreshToken is required',
        });
      }
      const tokens = await sessions.rotateRefreshToken(refreshToken);
      res.status(200).json({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenType: 'Bearer',
      });
    } catch (err) {
      next(err);
    }
  });

  router.get('/auth/me', requireAuth, (req, res) => {
    res.status(200).json({
      userId: req.actor!.userId,
      roles: req.actor!.roles,
      permissions: req.actor!.permissions,
    });
  });

  return router;
}
