import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@libfind/shared-types': resolve(root, 'packages/shared-types/src/index.ts'),
      '@libfind/config': resolve(root, 'packages/config/src/index.ts'),
      '@libfind/validation': resolve(root, 'packages/validation/src/index.ts'),
    },
  },
  test: {
    include: [
      'packages/**/src/**/*.test.ts',
      'apps/api/src/**/*.test.ts',
      'tests/unit/**/*.test.ts',
      'tests/integration/**/*.test.ts',
    ],
    environment: 'node',
  },
});
