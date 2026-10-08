import { createHash, randomUUID } from 'node:crypto';
import type { Prisma, PrismaClient } from '@prisma/client';

const GENESIS_HASH = '0'.repeat(64);

function canonicalPayload(input: {
  actorId: string | null;
  action: string;
  resourceType: string;
  resourceId: string | null;
  payloadJson: unknown;
  requestId: string | null;
  prevHash: string;
}): string {
  return JSON.stringify({
    actorId: input.actorId,
    action: input.action,
    resourceType: input.resourceType,
    resourceId: input.resourceId,
    payloadJson: input.payloadJson ?? null,
    requestId: input.requestId,
    prevHash: input.prevHash,
  });
}

export function computeAuditHash(
  prevHash: string,
  payload: Omit<Parameters<typeof canonicalPayload>[0], 'prevHash'>,
): string {
  const canonical = canonicalPayload({ ...payload, prevHash });
  return createHash('sha256').update(canonical).digest('hex');
}

export class AuditService {
  constructor(private readonly prisma: PrismaClient) {}

  /** Append-only hash-chained audit write (ADR-012). Never update/delete. */
  async append(event: {
    actorId?: string | null;
    action: string;
    resourceType: string;
    resourceId?: string | null;
    payloadJson?: Prisma.InputJsonValue;
    requestId?: string | null;
  }): Promise<{ id: string; hash: string }> {
    return this.prisma.$transaction(async (tx) => {
      const last = await tx.auditEvent.findFirst({
        orderBy: { seq: 'desc' },
        select: { hash: true },
      });
      const prevHash = last?.hash ?? GENESIS_HASH;
      const actorId = event.actorId ?? null;
      const resourceId = event.resourceId ?? null;
      const requestId = event.requestId ?? null;
      const hash = computeAuditHash(prevHash, {
        actorId,
        action: event.action,
        resourceType: event.resourceType,
        resourceId,
        payloadJson: event.payloadJson ?? null,
        requestId,
      });
      const id = randomUUID();
      await tx.auditEvent.create({
        data: {
          id,
          actorId,
          action: event.action,
          resourceType: event.resourceType,
          resourceId,
          prevHash,
          hash,
          requestId,
          ...(event.payloadJson !== undefined ? { payloadJson: event.payloadJson } : {}),
        },
      });
      return { id, hash };
    });
  }
}
