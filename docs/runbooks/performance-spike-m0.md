# M0-010 SSR / search performance spike

## Scope

Foundation-only. Not product listing search.

- Synthetic rows in `search_spike_documents` (seeded)
- MySQL FULLTEXT on `(title, body)`
- Server-rendered HTML at `GET /api/v1/spike/ssr-search?q=mechanic`
- CLI runner: `npm run spike:search`

## Reference profiles

| Profile                                    | Target                                                                                                          |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| Query budget (local MySQL FULLTEXT top-20) | ≤ 200ms wall time                                                                                               |
| Viewport                                   | 360px width (CSS + Playwright smoke)                                                                            |
| Network                                    | Reference 3G (~1.6 Mbps down, 750 kbps up, 150ms RTT) for future Lighthouse; M0 records server query time first |

## How to run

```bash
npm run db:seed
npm run spike:search
# optional HTML:
curl "http://localhost:3001/api/v1/spike/ssr-search?q=mechanic"
```

## Results log

| Date       | Environment                                  | Docs     | Query    | Elapsed ms                     | Budget ms | Within budget | Notes                                                                        |
| ---------- | -------------------------------------------- | -------- | -------- | ------------------------------ | --------- | ------------- | ---------------------------------------------------------------------------- |
| 2026-10-10 | local — Docker MySQL 8.4 (compose host 3316) | seed 150 | mechanic | 8–13 warm / 126 first/cold run | 200       | yes           | EXPLAIN uses FULLTEXT index `search_spike_documents_title_body_ft`; 20 hits. |

Reproduce on a clean database:

```bash
docker compose up -d mysql redis
npm run prisma:migrate      # prisma migrate deploy
npm run db:seed
npm run spike:search
```

If `withinBudget` is false, treat as **M0 gate blocker** — do not mark checklist J as passed.

## 360px check

Playwright smoke uses `360x640` viewport for the foundation shell. SSR spike HTML includes a `@media (max-width: 360px)` rule.
