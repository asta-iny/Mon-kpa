import { describe, expect, it } from 'vitest';
import { decimalAmountSchema, moneySchema, publicIdSchema } from '@libfind/validation';

describe('@libfind/validation foundation', () => {
  it('accepts UUID public ids', () => {
    expect(publicIdSchema.parse('550e8400-e29b-41d4-a716-446655440000')).toBeTruthy();
  });

  it('rejects non-uuid public ids', () => {
    expect(() => publicIdSchema.parse('1')).toThrow();
  });

  it('accepts decimal money strings', () => {
    expect(moneySchema.parse({ amount: '12.50', currency: 'LRD' })).toEqual({
      amount: '12.50',
      currency: 'LRD',
    });
  });

  it('rejects float-like invalid amount strings', () => {
    expect(() => decimalAmountSchema.parse('12.5.0')).toThrow();
  });
});
