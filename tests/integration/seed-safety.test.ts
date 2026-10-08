import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadCountiesJson } from '../../prisma/seed/counties.js';

describe('seed safety contract', () => {
  it('seed entrypoint refuses production', () => {
    const source = readFileSync(join(process.cwd(), 'prisma/seed/index.ts'), 'utf8');
    expect(source).toMatch(/appEnv === 'production'/);
    expect(source).toMatch(/Refusing to seed/);
    expect(source).toMatch(/ALLOW_STAGING_SEED/);
  });

  it('gazetteer seed is exactly 15 counties', () => {
    expect(loadCountiesJson()).toHaveLength(15);
  });
});
