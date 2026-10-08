import { createHash } from 'node:crypto';

/** Deterministic opaque CHAR(36) id from namespace+code (not cryptographic uniqueness claim). */
export function deterministicId(namespace: string, code: string): string {
  const hash = createHash('sha256').update(`${namespace}:${code}`).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
}
