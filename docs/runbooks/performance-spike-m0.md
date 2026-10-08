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

| Date       | Environment               | Docs     | Query    | Elapsed ms       | Budget ms | Within budget | Notes                            |
| ---------- | ------------------------- | -------- | -------- | ---------------- | --------- | ------------- | -------------------------------- |
| 2026-10-08 | local (pending first run) | seed 150 | mechanic | _fill after run_ | 200       | _fill_        | Record EXPLAIN + timing from CLI |

If `withinBudget` is false, treat as **M0 gate blocker** — do not mark checklist J as passed.

## 360px check

Playwright smoke uses `360x640` viewport for the foundation shell. SSR spike HTML includes a `@media (max-width: 360px)` rule.
