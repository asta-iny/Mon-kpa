/**
 * Safe seed entrypoint (M0 foundation).
 * - Local/test only unless explicitly approved for staging.
 * - Refuses production.
 * - Must never overwrite production business data.
 * - Synthetic data only.
 */

import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const appEnv = process.env.APP_ENV ?? process.env.NODE_ENV ?? 'local';

  if (appEnv === 'production') {
    throw new Error(
      'Refusing to seed: APP_ENV=production. Seeds must never run against production.',
    );
  }

  if (appEnv === 'staging' && process.env.ALLOW_STAGING_SEED !== 'true') {
    throw new Error(
      'Refusing to seed staging without ALLOW_STAGING_SEED=true and explicit approval.',
    );
  }

  const existing = await prisma.schemaBootstrap.findFirst({
    where: { label: 'm0-foundation' },
  });

  if (existing) {
    // Idempotent: do not destroy or overwrite existing foundation rows.
    console.info('Seed skipped: foundation marker already present (idempotent).');
    return;
  }

  await prisma.schemaBootstrap.create({
    data: {
      id: randomUUID(),
      label: 'm0-foundation',
    },
  });

  console.info('Seed complete: synthetic foundation marker created.');
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
