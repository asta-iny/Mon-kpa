/**
 * M0-010 search performance spike runner.
 * Requires DATABASE_URL and applied migrations + seed.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const QUERY = process.env.SPIKE_QUERY ?? 'mechanic';
const BUDGET_MS = Number(process.env.SPIKE_BUDGET_MS ?? 200);

async function main(): Promise<void> {
  const explain = await prisma.$queryRawUnsafe<unknown[]>(
    `EXPLAIN SELECT id, title FROM search_spike_documents WHERE MATCH(title, body) AGAINST (? IN NATURAL LANGUAGE MODE) LIMIT 20`,
    QUERY,
  );

  const started = Date.now();
  const rows = await prisma.$queryRawUnsafe<Array<{ id: string; title: string }>>(
    `SELECT id, title FROM search_spike_documents WHERE MATCH(title, body) AGAINST (? IN NATURAL LANGUAGE MODE) ORDER BY MATCH(title, body) AGAINST (? IN NATURAL LANGUAGE MODE) DESC LIMIT 20`,
    QUERY,
    QUERY,
  );
  const elapsedMs = Date.now() - started;
  const count = await prisma.searchSpikeDocument.count();

  const report = {
    query: QUERY,
    documentCount: count,
    hitCount: rows.length,
    elapsedMs,
    budgetMs: BUDGET_MS,
    withinBudget: elapsedMs <= BUDGET_MS,
    explain,
    sampleTitles: rows.slice(0, 5).map((r) => r.title),
  };

  console.log(
    JSON.stringify(
      report,
      (_key, value) => (typeof value === 'bigint' ? value.toString() : value),
      2,
    ),
  );
  if (!report.withinBudget) {
    console.error(`BLOCKER: search spike ${elapsedMs}ms exceeded budget ${BUDGET_MS}ms`);
    process.exitCode = 2;
  }
}

main()
  .catch((err: unknown) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
