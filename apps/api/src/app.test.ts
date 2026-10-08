import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from './app.js';
import { resetEnvCache } from './config/env.js';

describe('API foundation', () => {
  const previous = { ...process.env };

  beforeEach(() => {
    process.env.DATABASE_URL =
      process.env.DATABASE_URL ?? 'mysql://libfind:libfind@127.0.0.1:3306/libfind';
    process.env.REDIS_URL = process.env.REDIS_URL ?? 'redis://127.0.0.1:6379';
    process.env.APP_ENV = 'test';
    process.env.NODE_ENV = 'test';
    resetEnvCache();
  });

  afterEach(() => {
    process.env = { ...previous };
    resetEnvCache();
  });

  it('GET /api/v1/health returns ok with requestId', async () => {
    const { app } = createApp();
    const res = await request(app).get('/api/v1/health').expect(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('libfind-api');
    expect(typeof res.body.requestId).toBe('string');
    expect(res.headers['x-request-id']).toBeTruthy();
  });

  it('propagates incoming X-Request-Id', async () => {
    const { app } = createApp();
    const res = await request(app)
      .get('/api/v1/health')
      .set('X-Request-Id', 'test-request-id-001')
      .expect(200);
    expect(res.body.requestId).toBe('test-request-id-001');
    expect(res.headers['x-request-id']).toBe('test-request-id-001');
  });

  it('unknown routes return stable error envelope without stack', async () => {
    const { app } = createApp();
    const res = await request(app).get('/api/v1/does-not-exist').expect(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
    expect(res.body.error.requestId).toBeTruthy();
    expect(res.body.error.message).toBeTruthy();
    expect(JSON.stringify(res.body)).not.toMatch(/stack/i);
  });
});
