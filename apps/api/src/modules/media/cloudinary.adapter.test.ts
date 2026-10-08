import { describe, expect, it } from 'vitest';
import { MediaProviderError } from './cloudinary.errors.js';
import { shouldRetryCleanup } from './cloudinary.adapter.js';

describe('media cleanup contract', () => {
  it('retries retryable failures under maxAttempts', () => {
    const err = new MediaProviderError('retryable', 'timeout');
    expect(shouldRetryCleanup(err, { publicId: 'x', attempt: 1, maxAttempts: 3 })).toBe(true);
    expect(shouldRetryCleanup(err, { publicId: 'x', attempt: 3, maxAttempts: 3 })).toBe(false);
  });

  it('does not retry permanent failures', () => {
    const err = new MediaProviderError('permanent', 'not found');
    expect(shouldRetryCleanup(err, { publicId: 'x', attempt: 1, maxAttempts: 3 })).toBe(false);
  });
});
