import { describe, expect, it } from 'vitest';
import { loadServerEnv, publicWebEnvSchema } from './index.js';

describe('loadServerEnv', () => {
  it('loads a valid local environment', () => {
    const env = loadServerEnv({
      NODE_ENV: 'local',
      APP_ENV: 'local',
      DATABASE_URL: 'mysql://libfind:libfind@127.0.0.1:3306/libfind',
      REDIS_URL: 'redis://127.0.0.1:6379',
    });
    expect(env.PORT).toBe(3001);
    expect(env.APP_ENV).toBe('local');
  });

  it('rejects missing DATABASE_URL', () => {
    expect(() =>
      loadServerEnv({
        NODE_ENV: 'local',
        APP_ENV: 'local',
      }),
    ).toThrow(/DATABASE_URL/);
  });
});

describe('publicWebEnvSchema', () => {
  it('accepts non-secret public defaults', () => {
    const parsed = publicWebEnvSchema.parse({});
    expect(parsed.VITE_API_BASE_URL).toContain('/api/v1');
  });
});
