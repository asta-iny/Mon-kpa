import { randomInt, randomUUID } from 'node:crypto';
import type { PrismaClient } from '@prisma/client';
import { hashSecret, normalizePhoneE164, sha256Hex, verifySecret } from './crypto.js';
import { consumeRateLimit } from '../../infrastructure/rate-limit.js';
import { AppError } from '../../middleware/error-handler.js';

const OTP_TTL_MS = 5 * 60 * 1000;

export class OtpService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Creates an OTP challenge. Returns the plaintext code only for local/test
   * harnesses when APP_ENV is local|test — never log or SMS in M0 skeleton
   * (Phase 1 wires the SMS provider).
   */
  async createChallenge(input: {
    phone: string;
    ip?: string;
    deviceId?: string;
    exposeCodeForLocal?: boolean;
  }): Promise<{ challengeId: string; expiresAt: Date; code?: string }> {
    const phoneE164 = normalizePhoneE164(input.phone);
    const rl = await consumeRateLimit({
      key: `otp:create:${phoneE164}`,
      limit: 5,
      windowSeconds: 15 * 60,
      failClosed: true,
    });
    if (!rl.allowed) {
      throw new AppError({
        statusCode: 429,
        code: 'RATE_LIMITED',
        message: 'Too many OTP requests. Try again later.',
      });
    }

    const code = String(randomInt(100000, 999999));
    const id = randomUUID();
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);
    await this.prisma.otpChallenge.create({
      data: {
        id,
        phoneE164,
        codeHash: hashSecret(code),
        expiresAt,
        requestIpHash: input.ip ? sha256Hex(input.ip) : null,
        requestDeviceId: input.deviceId ?? null,
      },
    });

    const result: { challengeId: string; expiresAt: Date; code?: string } = {
      challengeId: id,
      expiresAt,
    };
    if (input.exposeCodeForLocal) {
      result.code = code;
    }
    return result;
  }

  async verifyAndConsume(input: {
    challengeId: string;
    code: string;
  }): Promise<{ phoneE164: string }> {
    const challenge = await this.prisma.otpChallenge.findUnique({
      where: { id: input.challengeId },
    });
    if (!challenge || challenge.consumedAt) {
      throw new AppError({
        statusCode: 400,
        code: 'BAD_REQUEST',
        message: 'Invalid or consumed OTP challenge',
      });
    }
    if (challenge.expiresAt.getTime() < Date.now()) {
      throw new AppError({
        statusCode: 400,
        code: 'BAD_REQUEST',
        message: 'OTP challenge expired',
      });
    }
    if (challenge.attemptCount >= challenge.maxAttempts) {
      throw new AppError({
        statusCode: 429,
        code: 'RATE_LIMITED',
        message: 'OTP attempt limit exceeded',
      });
    }

    const ok = verifySecret(input.code, challenge.codeHash);
    await this.prisma.otpChallenge.update({
      where: { id: challenge.id },
      data: {
        attemptCount: { increment: 1 },
        ...(ok ? { consumedAt: new Date() } : {}),
      },
    });

    if (!ok) {
      throw new AppError({
        statusCode: 401,
        code: 'UNAUTHORIZED',
        message: 'Invalid OTP code',
      });
    }

    return { phoneE164: challenge.phoneE164 };
  }
}
