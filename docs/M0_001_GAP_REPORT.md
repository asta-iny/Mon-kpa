# M0 Gap Report

**Updated:** 2026-10-10  
**Gazetteer owner decision:** Option 2 — 15 counties only; district/community OPEN.

## Status by backlog ID

| IDs                                          | Status                                                  |
| -------------------------------------------- | ------------------------------------------------------- |
| M0-001–007, M0-009, M0-011–012               | Done (prior bootstrap)                                  |
| M0-008 Observability                         | Done (health/ready/metrics + runbook)                   |
| M0-010 SSR/search spike                      | Done (seeded FULLTEXT + SSR HTML + CLI; record timings) |
| M0-013–016 Identity/locations/audit/fixtures | Done (counties only; no district/community rows)        |
| M0-017–021 Auth/RBAC/audit/rate-limit        | Done (skeleton; SMS Phase 1)                            |
| M0-022–024 Gazetteer/categories              | Done (import + hierarchy validators + APIs)             |
| M0-025–029 Cloudinary                        | Done (adapter, sign, metadata, retry/cleanup contracts) |
| Playwright smoke                             | Done (harness + CI step)                                |

## OPEN decisions (not silently resolved)

- District/community gazetteer dataset (incl. Montserrado communities)
- Payment provider, Cloudinary plan limits, pilot geography cells, etc.

## Evidence run — 2026-10-10

- Environment defect fixed: `docker-compose.yml` removed the MySQL 8.4-incompatible
  `--default-authentication-plugin=caching_sha2_password` flag (8.4 aborted the server; the
  partial volume was recreated). CI was unaffected — its MySQL service defines no such flag.
- Clean-volume run against Docker MySQL 8.4 (host `3316`) + Redis 7 (host `6380`):
  `prisma migrate deploy` applied both migrations; `db:seed` created counties=15, categories=6,
  spikeDocs=150, fixtureUser.
- `npm run spike:search`: 8–13 ms warm / 126 ms first run, budget 200 ms — within budget;
  EXPLAIN uses the `search_spike_documents_title_body_ft` FULLTEXT index (20 hits).
- Live API: `/health` 200, `/ready` 200 (database + redis true), `/metrics` 200,
  `/locations/counties` 200 (15 rows), `/spike/ssr-search` 200 (20 hits).
- Local quality gates: lint clean, `format:check` clean, strict typecheck clean, 23/23 unit +
  integration tests pass, `prisma:validate` valid, OpenAPI validation passed.
- `npm audit --audit-level=high`: 0 vulnerabilities.
- gitleaks (official container, against git history): 3 commits scanned, no leaks.
- Docker builds: both `docker/api.Dockerfile` and `docker/web.Dockerfile` verified end-to-end.
  Note: the repo Dockerfiles rely on npm's default 300 s `fetch-timeout`, which stalled with
  `EIDLETIMEOUT` in the build container on this network; they build cleanly with
  `fetch-timeout=600000` plus an npm cache mount. Hardening recommended (not yet applied).
- `format:check`: added `.gitattributes` (`* text=auto eol=lf`) to end the Windows CRLF vs CI
  LF divergence, and fixed one committed non-Prettier-compliant file
  (`scripts/m0-search-spike.ts`). `format:check` now passes repo-wide.
- Playwright smoke not run locally: `playwright.config.ts` / `tests/e2e/smoke.spec.ts` hardcode
  ports 3001/5173, which are held by another project (GBOWEE). Needs an owner decision on a
  dedicated port (or ephemeral port assignment).

## Gate

Owner acceptance still required after checklist review and recorded spike timings.
