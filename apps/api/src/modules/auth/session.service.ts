import { createHmac, randomBytes, randomUUID } from 'node:crypto';
import type { PrismaClient } from '@prisma/client';
import { getEnv } from '../../config/env.js';
import { AppError } from '../../middleware/error-handler.js';
import { hashSecret, verifySecret } from './crypto.js';

const ACCESS_TTL_SECONDS = 15 * 60;
const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export interface AuthActor {
  userId: string;
  permissions: string[];
  roles: string[];
}

export class SessionService {
  constructor(private readonly prisma: PrismaClient) {}

  private accessSecret(): string {
    const env = getEnv();
    const secret = env.ACCESS_TOKEN_SECRET;
    if (!secret) {
      if (env.APP_ENV === 'local' || env.APP_ENV === 'test') {
        return 'local-dev-access-secret-not-for-production';
      }
      throw new AppError({
        statusCode: 500,
        code: 'INTERNAL_ERROR',
        message: 'ACCESS_TOKEN_SECRET is not configured',
        expose: false,
      });
    }
    return secret;
  }

  signAccessToken(actor: AuthActor): string {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(
      JSON.stringify({
        sub: actor.userId,
        permissions: actor.permissions,
        roles: actor.roles,
        exp: Math.floor(Date.now() / 1000) + ACCESS_TTL_SECONDS,
      }),
    ).toString('base64url');
    const sig = createHmac('sha256', this.accessSecret())
      .update(`${header}.${payload}`)
      .digest('base64url');
    return `${header}.${payload}.${sig}`;
  }

  verifyAccessToken(token: string): AuthActor {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new AppError({
        statusCode: 401,
        code: 'UNAUTHORIZED',
        message: 'Invalid access token',
      });
    }
    const [header, payload, sig] = parts as [string, string, string];
    const expected = createHmac('sha256', this.accessSecret())
      .update(`${header}.${payload}`)
      .digest('base64url');
    if (sig !== expected) {
      throw new AppError({
        statusCode: 401,
        code: 'UNAUTHORIZED',
        message: 'Invalid access token signature',
      });
    }
    const body = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      sub: string;
      permissions: string[];
      roles: string[];
      exp: number;
    };
    if (body.exp * 1000 < Date.now()) {
      throw new AppError({
        statusCode: 401,
        code: 'UNAUTHORIZED',
        message: 'Access token expired',
      });
    }
    return {
      userId: body.sub,
      permissions: body.permissions ?? [],
      roles: body.roles ?? [],
    };
  }

  async loadActorPermissions(userId: string): Promise<AuthActor> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: { include: { permission: true } },
              },
            },
          },
        },
      },
    });
    if (!user || user.status !== 'active') {
      throw new AppError({
        statusCode: 401,
        code: 'UNAUTHORIZED',
        message: 'User not found or inactive',
      });
    }
    const roles = user.roles.map((r) => r.role.code);
    const permissions = [
      ...new Set(user.roles.flatMap((r) => r.role.permissions.map((p) => p.permission.code))),
    ];
    return { userId, roles, permissions };
  }

  async issueSession(userId: string): Promise<{
    accessToken: string;
    refreshToken: string;
    sessionId: string;
  }> {
    const actor = await this.loadActorPermissions(userId);
    const refreshToken = randomBytes(32).toString('base64url');
    const sessionId = randomUUID();
    const familyId = randomUUID();
    await this.prisma.session.create({
      data: {
        id: sessionId,
        userId,
        familyId,
        refreshTokenHash: hashSecret(refreshToken),
        expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
      },
    });
    return {
      accessToken: this.signAccessToken(actor),
      refreshToken,
      sessionId,
    };
  }

  /** Rotate refresh token; reuse of an old token revokes the entire family. */
  async rotateRefreshToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    sessionId: string;
  }> {
    const sessions = await this.prisma.session.findMany({
      where: { revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    const match = sessions.find((s) => verifySecret(refreshToken, s.refreshTokenHash));
    if (!match) {
      // Possible reuse against a rotated token: revoke family if we can locate hash elsewhere
      const any = await this.prisma.session.findMany({ take: 500 });
      const reused = any.find((s) => verifySecret(refreshToken, s.refreshTokenHash));
      if (reused) {
        await this.prisma.session.updateMany({
          where: { familyId: reused.familyId },
          data: { revokedAt: new Date() },
        });
      }
      throw new AppError({
        statusCode: 401,
        code: 'UNAUTHORIZED',
        message: 'Invalid refresh token',
      });
    }

    if (match.replacedById) {
      await this.prisma.session.updateMany({
        where: { familyId: match.familyId },
        data: { revokedAt: new Date() },
      });
      throw new AppError({
        statusCode: 401,
        code: 'UNAUTHORIZED',
        message: 'Refresh token reuse detected; session family revoked',
      });
    }

    const newRefresh = randomBytes(32).toString('base64url');
    const newId = randomUUID();
    await this.prisma.$transaction([
      this.prisma.session.create({
        data: {
          id: newId,
          userId: match.userId,
          familyId: match.familyId,
          refreshTokenHash: hashSecret(newRefresh),
          expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
        },
      }),
      this.prisma.session.update({
        where: { id: match.id },
        data: { replacedById: newId, revokedAt: new Date() },
      }),
    ]);

    const actor = await this.loadActorPermissions(match.userId);
    return {
      accessToken: this.signAccessToken(actor),
      refreshToken: newRefresh,
      sessionId: newId,
    };
  }
}
