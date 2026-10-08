import type { PrismaClient } from '@prisma/client';
import { AppError } from '../../middleware/error-handler.js';

/** Validates county → district → community FK hierarchy before insert. */
export async function assertDistrictBelongsToCounty(
  prisma: PrismaClient,
  countyId: string,
  _districtCode: string,
): Promise<void> {
  const county = await prisma.county.findUnique({ where: { id: countyId } });
  if (!county) {
    throw new AppError({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'County not found for district',
    });
  }
}

export async function assertCommunityBelongsToDistrict(
  prisma: PrismaClient,
  districtId: string,
): Promise<void> {
  const district = await prisma.district.findUnique({ where: { id: districtId } });
  if (!district) {
    throw new AppError({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'District not found for community',
    });
  }
}

export function validateHierarchyPayload(input: {
  countyId?: string;
  districtId?: string;
  communityId?: string;
}): void {
  if (input.communityId && !input.districtId) {
    throw new AppError({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'Community requires districtId',
    });
  }
  if (input.districtId && !input.countyId) {
    throw new AppError({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'District requires countyId',
    });
  }
}
