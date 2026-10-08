# Environments and secrets

| Environment | Purpose | Data | Secrets source |
|---|---|---|---|
| local | development / agent execution | synthetic only | local `.env` (gitignored) |
| staging | QA / UAT | synthetic or explicitly approved test data | hosting secret store |
| production | live | real data | hosting secret store |

## Rules

- `.env.example` contains names and non-secret local placeholders only.
- Secrets never enter source control, frontend bundles, logs, or fixtures.
- Server config lives in `@libfind/config` (`loadServerEnv`). Do not import that package into `apps/web`.
- Frontend may only use `VITE_*` public values.
- Material state-changing endpoints will require `Idempotency-Key` (documented for Phase 1+; not product-active in M0 skeleton).
