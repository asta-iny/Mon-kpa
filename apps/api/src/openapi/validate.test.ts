import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { validateOpenApiDocument } from './validate.js';

describe('OpenAPI skeleton', () => {
  it('validates the checked-in contract', () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const raw = readFileSync(join(here, 'openapi.yaml'), 'utf8');
    expect(() => validateOpenApiDocument(raw)).not.toThrow();
  });

  it('rejects missing health path', () => {
    const invalid = `
openapi: 3.0.3
info:
  title: X
  version: 0.0.0
servers:
  - url: /api/v1
paths: {}
components:
  schemas: {}
`;
    expect(() => validateOpenApiDocument(invalid)).toThrow(/health/i);
  });
});
