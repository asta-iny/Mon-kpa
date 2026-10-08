import { createClient, type RedisClientType } from 'redis';
import { getEnv } from '../config/env.js';

let client: RedisClientType | undefined;
let connectFailed = false;

export async function getRedis(): Promise<RedisClientType | null> {
  if (connectFailed) {
    return null;
  }
  if (client?.isOpen) {
    return client;
  }
  const env = getEnv();
  client = createClient({ url: env.REDIS_URL });
  client.on('error', () => {
    /* logged by callers; avoid unhandled */
  });
  try {
    await client.connect();
    return client;
  } catch {
    connectFailed = false;
    client = undefined;
    return null;
  }
}

export async function pingRedis(): Promise<boolean> {
  try {
    const redis = await getRedis();
    if (!redis) {
      return false;
    }
    const pong = await redis.ping();
    return pong === 'PONG';
  } catch {
    return false;
  }
}

export async function disconnectRedis(): Promise<void> {
  if (client?.isOpen) {
    await client.quit();
  }
  client = undefined;
  connectFailed = false;
}
