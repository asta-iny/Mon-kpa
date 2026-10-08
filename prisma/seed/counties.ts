import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import type { PrismaClient } from '@prisma/client';
import { deterministicId } from './ids.js';

interface CountySeed {
  code: string;
  name: string;
}

export function loadCountiesJson(): CountySeed[] {
  const here = dirname(fileURLToPath(import.meta.url));
  const raw = readFileSync(join(here, 'data/counties.json'), 'utf8');
  const parsed = JSON.parse(raw) as CountySeed[];
  if (parsed.length !== 15) {
    throw new Error(`Expected 15 counties, got ${parsed.length}`);
  }
  return parsed;
}

/**
 * Owner decision: seed official 15 counties only.
 * Districts/communities remain OPEN pending an approved dataset.
 */
export async function seedCounties(prisma: PrismaClient): Promise<number> {
  const counties = loadCountiesJson();
  let upserted = 0;
  for (const county of counties) {
    const id = deterministicId('county', county.code);
    await prisma.county.upsert({
      where: { code: county.code },
      create: { id, code: county.code, name: county.name },
      update: { name: county.name },
    });
    upserted += 1;
  }
  return upserted;
}

export function newOpaqueId(): string {
  return randomUUID();
}
