import { describe, expect, it } from 'vitest';
import { validateHierarchyPayload } from './hierarchy.js';
import { AppError } from '../../middleware/error-handler.js';

describe('location hierarchy validation', () => {
  it('rejects community without district', () => {
    expect(() => validateHierarchyPayload({ communityId: 'c1', countyId: 'co1' })).toThrow(
      AppError,
    );
  });

  it('rejects district without county', () => {
    expect(() => validateHierarchyPayload({ districtId: 'd1' })).toThrow(AppError);
  });

  it('accepts county-only', () => {
    expect(() => validateHierarchyPayload({ countyId: 'co1' })).not.toThrow();
  });
});
