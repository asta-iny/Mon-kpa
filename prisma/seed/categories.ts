import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { PrismaClient } from '@prisma/client';
import { deterministicId } from './ids.js';

interface CategoryNode {
  code: string;
  name: string;
  isSynthetic?: boolean;
  sortOrder?: number;
  children?: CategoryNode[];
}

export async function seedCategories(prisma: PrismaClient): Promise<number> {
  const here = dirname(fileURLToPath(import.meta.url));
  const raw = readFileSync(join(here, 'data/categories.json'), 'utf8');
  const tree = JSON.parse(raw) as CategoryNode[];
  let count = 0;

  async function upsertNode(node: CategoryNode, parentId: string | null): Promise<void> {
    const id = deterministicId('category', node.code);
    await prisma.category.upsert({
      where: { code: node.code },
      create: {
        id,
        code: node.code,
        name: node.name,
        parentId,
        sortOrder: node.sortOrder ?? 0,
        isSynthetic: node.isSynthetic ?? true,
      },
      update: {
        name: node.name,
        parentId,
        sortOrder: node.sortOrder ?? 0,
        isSynthetic: node.isSynthetic ?? true,
      },
    });
    count += 1;
    for (const child of node.children ?? []) {
      await upsertNode(child, id);
    }
  }

  for (const root of tree) {
    await upsertNode(root, null);
  }
  return count;
}
