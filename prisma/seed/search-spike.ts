import type { PrismaClient } from '@prisma/client';
import { loadCountiesJson } from './counties.js';
import { deterministicId } from './ids.js';

const TEMPLATES = [
  'Verified mechanic near {county}',
  'Fresh produce market in {county}',
  'Phone repair workshop {county}',
  'Apartment listing spike doc {county}',
  'Taxi service coverage {county}',
];

/** Synthetic FULLTEXT corpus for M0-010 only — not product listings. */
export async function seedSearchSpikeDocuments(
  prisma: PrismaClient,
  perCounty = 10,
): Promise<number> {
  const counties = loadCountiesJson();
  let count = 0;
  for (const county of counties) {
    for (let i = 0; i < perCounty; i += 1) {
      const key = `${county.code}:${i}`;
      const id = deterministicId('spike', key);
      const title = TEMPLATES[i % TEMPLATES.length]!.replace('{county}', county.name);
      const body = `Synthetic M0 search spike document ${i} for ${county.name} (${county.code}). Low-data mobile discovery benchmark corpus.`;
      await prisma.searchSpikeDocument.upsert({
        where: { id },
        create: { id, title, body, countyCode: county.code },
        update: { title, body, countyCode: county.code },
      });
      count += 1;
    }
  }
  return count;
}
