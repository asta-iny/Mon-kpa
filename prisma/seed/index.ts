/**
 * Safe seed entrypoint (M0 foundation).
 * - Local/test only unless explicitly approved for staging.
 * - Refuses production.
 * - Must never overwrite production business data.
 * - Synthetic / official public county data only.
 * - OPEN: district/community gazetteer rows await owner-approved dataset.
 */

import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { seedCategories } from './categories.js';
import { seedCounties } from './counties.js';
import { seedRbac, seedSyntheticUser } from './rbac.js';
import { seedSearchSpikeDocuments } from './search-spike.js';

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

  if (!existing) {
    await prisma.schemaBootstrap.create({
      data: {
        id: randomUUID(),
        label: 'm0-foundation',
      },
    });
  }

  const countyCount = await seedCounties(prisma);
  await seedRbac(prisma);
  const userId = await seedSyntheticUser(prisma);
  const categoryCount = await seedCategories(prisma);
  const spikeCount = await seedSearchSpikeDocuments(prisma, 10);

  console.info(
    `Seed complete: counties=${countyCount}, categories=${categoryCount}, spikeDocs=${spikeCount}, fixtureUser=${userId}`,
  );
  console.info(
    'OPEN: Montserrado (and other) district/community gazetteer rows not seeded — awaiting owner-approved dataset.',
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
