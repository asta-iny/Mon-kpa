import { z } from 'zod';

const nodeEnvSchema = z.enum(['local', 'test', 'staging', 'production']);

/**
 * Server-side environment contract.
 * Never import this package into frontend bundles.
 */
export const serverEnvSchema = z.object({
  NODE_ENV: nodeEnvSchema.default('local'),
  APP_ENV: nodeEnvSchema.default('local'),
  PORT: z.coerce.number().int().positive().default(3001),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1).default('redis://127.0.0.1:6379'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  /** Cloudinary — server only; never expose API secret to the browser. */
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  /** JWT / session secrets — required when auth module is activated. */
  ACCESS_TOKEN_SECRET: z.string().optional(),
  REFRESH_TOKEN_SECRET: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function loadServerEnv(source: NodeJS.ProcessEnv = process.env): ServerEnv {
  const parsed = serverEnvSchema.safeParse(source);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid server environment: ${details}`);
  }
  return parsed.data;
}

export function isProductionLike(env: ServerEnv): boolean {
  return env.APP_ENV === 'production' || env.APP_ENV === 'staging';
}

/**
 * Public web env names only. Values must be VITE_-prefixed and non-secret.
 * Cloudinary API secret must never appear here.
 */
export const publicWebEnvSchema = z.object({
  VITE_API_BASE_URL: z.string().url().default('http://localhost:3001/api/v1'),
  VITE_APP_ENV: nodeEnvSchema.default('local'),
});

export type PublicWebEnv = z.infer<typeof publicWebEnvSchema>;
