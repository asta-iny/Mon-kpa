import pino from 'pino';
import { getEnv } from '../config/env.js';

export function createLogger() {
  const env = getEnv();
  return pino({
    level: env.LOG_LEVEL,
    base: {
      service: 'libfind-api',
      env: env.APP_ENV,
    },
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'password',
        'otp',
        'code',
        'token',
        'refreshToken',
        'accessToken',
        'phone',
        'phoneE164',
        'CLOUDINARY_API_SECRET',
        'ACCESS_TOKEN_SECRET',
        'REFRESH_TOKEN_SECRET',
        'DATABASE_URL',
        '*.password',
        '*.otp',
        '*.refreshToken',
        '*.accessToken',
        '*.CLOUDINARY_API_SECRET',
      ],
      remove: true,
    },
  });
}

export type AppLogger = ReturnType<typeof createLogger>;
