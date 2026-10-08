import type { PrismaClient } from '@prisma/client';
import { deterministicId } from './ids.js';

const ROLES = [
  { code: 'user', name: 'User', description: 'Default authenticated user' },
  { code: 'seller', name: 'Seller', description: 'Listing creator (Phase 1)' },
  { code: 'moderator', name: 'Moderator', description: 'Trust & safety staff' },
  { code: 'admin', name: 'Admin', description: 'Platform administrator' },
] as const;

const PERMISSIONS = [
  { code: 'auth:session:read', description: 'Read own session' },
  { code: 'media:upload:sign', description: 'Request Cloudinary signed upload' },
  { code: 'media:metadata:write', description: 'Persist media metadata' },
  { code: 'audit:read', description: 'Read audit events (staff)' },
  { code: 'moderation:act', description: 'Perform moderation actions' },
  { code: 'admin:manage', description: 'Administrative management' },
] as const;

const ROLE_PERMISSIONS: Record<string, string[]> = {
  user: ['auth:session:read', 'media:upload:sign', 'media:metadata:write'],
  seller: ['auth:session:read', 'media:upload:sign', 'media:metadata:write'],
  moderator: [
    'auth:session:read',
    'media:upload:sign',
    'media:metadata:write',
    'audit:read',
    'moderation:act',
  ],
  admin: [
    'auth:session:read',
    'media:upload:sign',
    'media:metadata:write',
    'audit:read',
    'moderation:act',
    'admin:manage',
  ],
};

export async function seedRbac(prisma: PrismaClient): Promise<void> {
  for (const role of ROLES) {
    await prisma.role.upsert({
      where: { code: role.code },
      create: {
        id: deterministicId('role', role.code),
        code: role.code,
        name: role.name,
        description: role.description,
      },
      update: { name: role.name, description: role.description },
    });
  }

  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      create: {
        id: deterministicId('permission', perm.code),
        code: perm.code,
        description: perm.description,
      },
      update: { description: perm.description },
    });
  }

  for (const [roleCode, permCodes] of Object.entries(ROLE_PERMISSIONS)) {
    const role = await prisma.role.findUniqueOrThrow({ where: { code: roleCode } });
    for (const permCode of permCodes) {
      const permission = await prisma.permission.findUniqueOrThrow({
        where: { code: permCode },
      });
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: { roleId: role.id, permissionId: permission.id },
        },
        create: { roleId: role.id, permissionId: permission.id },
        update: {},
      });
    }
  }
}

/** Synthetic fixture user for local/test only. */
export async function seedSyntheticUser(prisma: PrismaClient): Promise<string> {
  const phone = '+231555000001';
  const userId = deterministicId('user', phone);
  await prisma.user.upsert({
    where: { phoneE164: phone },
    create: {
      id: userId,
      phoneE164: phone,
      displayName: 'Synthetic Fixture User',
      status: 'active',
    },
    update: { displayName: 'Synthetic Fixture User', status: 'active' },
  });

  const userRole = await prisma.role.findUniqueOrThrow({ where: { code: 'user' } });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId, roleId: userRole.id } },
    create: { userId, roleId: userRole.id },
    update: {},
  });

  return userId;
}
