import { getRedis } from './redis.js';

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds?: number;
}

/**
 * Fixed-window rate limit via Redis.
 * Fail-closed when Redis is unavailable for auth-sensitive paths
 * (caller may choose fail-open for non-critical routes).
 */
export async function consumeRateLimit(options: {
  key: string;
  limit: number;
  windowSeconds: number;
  failClosed?: boolean;
}): Promise<RateLimitResult> {
  const redis = await getRedis();
  if (!redis) {
    if (options.failClosed ?? true) {
      return { allowed: false, remaining: 0, retryAfterSeconds: options.windowSeconds };
    }
    return { allowed: true, remaining: options.limit };
  }

  const redisKey = `rl:${options.key}`;
  const count = await redis.incr(redisKey);
  if (count === 1) {
    await redis.expire(redisKey, options.windowSeconds);
  }
  const ttl = await redis.ttl(redisKey);
  const remaining = Math.max(0, options.limit - count);
  if (count > options.limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: ttl > 0 ? ttl : options.windowSeconds,
    };
  }
  return { allowed: true, remaining };
}
