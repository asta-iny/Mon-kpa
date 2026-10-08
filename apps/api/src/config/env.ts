import { loadServerEnv, type ServerEnv } from '@libfind/config';

let cached: ServerEnv | undefined;

export function getEnv(): ServerEnv {
  if (!cached) {
    cached = loadServerEnv();
  }
  return cached;
}

/** Test helper — reset cached env between cases. */
export function resetEnvCache(): void {
  cached = undefined;
}
