import { describe, expect, it } from 'vitest';
import { computeAuditHash } from './audit.service.js';

describe('audit hash chain', () => {
  it('is deterministic for the same payload', () => {
    const prev = '0'.repeat(64);
    const a = computeAuditHash(prev, {
      actorId: 'u1',
      action: 'test',
      resourceType: 'x',
      resourceId: 'r1',
      payloadJson: { a: 1 },
      requestId: 'req',
    });
    const b = computeAuditHash(prev, {
      actorId: 'u1',
      action: 'test',
      resourceType: 'x',
      resourceId: 'r1',
      payloadJson: { a: 1 },
      requestId: 'req',
    });
    expect(a).toBe(b);
    expect(a).toHaveLength(64);
  });

  it('changes when prevHash changes', () => {
    const payload = {
      actorId: null,
      action: 'test',
      resourceType: 'x',
      resourceId: null,
      payloadJson: null,
      requestId: null,
    };
    const h1 = computeAuditHash('0'.repeat(64), payload);
    const h2 = computeAuditHash('1'.repeat(64), payload);
    expect(h1).not.toBe(h2);
  });
});
