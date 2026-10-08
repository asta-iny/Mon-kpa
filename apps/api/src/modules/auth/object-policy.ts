import type { AuthActor } from './session.service.js';

export type PolicyAction = 'read' | 'update' | 'delete' | 'manage';

export interface PolicyResource {
  type: string;
  id: string;
  ownerId?: string;
  businessId?: string;
}

/**
 * Object-level authorization interface.
 * RBAC alone is insufficient — ownership / membership must be checked.
 * Default implementation is deny-by-default.
 */
export interface ObjectAuthorizationPolicy {
  can(actor: AuthActor, action: PolicyAction, resource: PolicyResource): Promise<boolean>;
}

export class DenyByDefaultPolicy implements ObjectAuthorizationPolicy {
  async can(actor: AuthActor, action: PolicyAction, resource: PolicyResource): Promise<boolean> {
    if (actor.permissions.includes('admin:manage')) {
      return true;
    }
    if (resource.ownerId && resource.ownerId === actor.userId) {
      return action === 'read' || action === 'update' || action === 'delete';
    }
    return false;
  }
}

export async function assertCan(
  policy: ObjectAuthorizationPolicy,
  actor: AuthActor,
  action: PolicyAction,
  resource: PolicyResource,
): Promise<void> {
  const allowed = await policy.can(actor, action, resource);
  if (!allowed) {
    const { AppError } = await import('../../middleware/error-handler.js');
    throw new AppError({
      statusCode: 403,
      code: 'FORBIDDEN',
      message: 'Insufficient object-level permission',
    });
  }
}
