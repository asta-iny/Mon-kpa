import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('seed safety contract', () => {
  it('seed entrypoint refuses production', () => {
    const source = readFileSync(join(process.cwd(), 'prisma/seed/index.ts'), 'utf8');
    expect(source).toMatch(/appEnv === 'production'/);
    expect(source).toMatch(/Refusing to seed/);
    expect(source).toMatch(/ALLOW_STAGING_SEED/);
  });
});
