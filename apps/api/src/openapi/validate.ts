import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';
import { z } from 'zod';

const openApiSkeletonSchema = z.object({
  openapi: z.string().regex(/^3\./),
  info: z.object({
    title: z.string().min(1),
    version: z.string().min(1),
  }),
  paths: z.record(z.string(), z.unknown()),
  components: z.object({
    schemas: z.record(z.string(), z.unknown()),
  }),
});

export function validateOpenApiDocument(raw: string): void {
  const doc = parseYaml(raw);
  const parsed = openApiSkeletonSchema.safeParse(doc);
  if (!parsed.success) {
    throw new Error(`OpenAPI validation failed: ${parsed.error.message}`);
  }

  if (!parsed.data.paths['/health']) {
    throw new Error('OpenAPI skeleton must define /health');
  }

  const info = doc as { servers?: Array<{ url?: string }> };
  const base = info.servers?.[0]?.url;
  if (base !== '/api/v1') {
    throw new Error(`Expected servers[0].url to be /api/v1, got ${String(base)}`);
  }
}

function main(): void {
  const here = dirname(fileURLToPath(import.meta.url));
  const yamlPath = join(here, 'openapi.yaml');
  const raw = readFileSync(yamlPath, 'utf8');
  validateOpenApiDocument(raw);
  console.info('OpenAPI skeleton validation passed.');
}

const isDirectRun = process.argv[1]?.includes('openapi') ?? false;
if (isDirectRun) {
  try {
    main();
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
