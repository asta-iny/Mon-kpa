import { describe, expect, it } from 'vitest';
import { hashSecret, normalizePhoneE164, verifySecret } from './crypto.js';

describe('auth crypto', () => {
  it('hashes and verifies secrets', () => {
    const stored = hashSecret('123456');
    expect(verifySecret('123456', stored)).toBe(true);
    expect(verifySecret('000000', stored)).toBe(false);
  });

  it('normalizes Liberian phones', () => {
    expect(normalizePhoneE164('0777123456')).toBe('+231777123456');
    expect(normalizePhoneE164('+231555000001')).toBe('+231555000001');
  });
});
