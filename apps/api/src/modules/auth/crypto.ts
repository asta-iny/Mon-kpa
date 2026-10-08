import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const SCRYPT_KEYLEN = 64;

export function hashSecret(value: string, salt?: string): string {
  const usedSalt = salt ?? randomBytes(16).toString('hex');
  const derived = scryptSync(value, usedSalt, SCRYPT_KEYLEN).toString('hex');
  return `${usedSalt}:${derived}`;
}

export function verifySecret(value: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) {
    return false;
  }
  const derived = scryptSync(value, salt, SCRYPT_KEYLEN);
  const expected = Buffer.from(hash, 'hex');
  if (expected.length !== derived.length) {
    return false;
  }
  return timingSafeEqual(expected, derived);
}

export function sha256Hex(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

/** Liberia-focused E.164 normalizer foundation (M0 skeleton). */
export function normalizePhoneE164(input: string): string {
  const digits = input.replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) {
    return `+${digits.slice(1).replace(/\D/g, '')}`;
  }
  const only = digits.replace(/\D/g, '');
  if (only.startsWith('231')) {
    return `+${only}`;
  }
  if (only.startsWith('0') && only.length >= 9) {
    return `+231${only.slice(1)}`;
  }
  throw new Error('Invalid phone number for E.164 normalization');
}
