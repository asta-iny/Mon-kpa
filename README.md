# LibFind

Verified local discovery and marketplace platform for Liberia.

**Current gate:** M0 / Phase 0 — Foundations only. Phase 1 product features are out of scope until the owner accepts M0.

## Source baseline

- **Engineering Implementation Specification v1.0** — engineering implementation contract (authoritative for stack).
- **Production-Grade Product & Engineering Specification v2.0** — product baseline.

Use **MySQL 8.x + Prisma**, not the older PostgreSQL/PostGIS diagram in v2.0.

## Locked stack

React + TypeScript + Tailwind CSS + React Router + TanStack Query + React Hook Form/Zod  
Node.js + TypeScript + Express + REST/OpenAPI (`/api/v1`)  
MySQL 8.x + Prisma · Redis + BullMQ · Cloudinary  
Docker + managed containers · GitHub Actions · Modular monolith first

## Repository layout

```text
apps/web          React frontend (Phase 0 shell)
apps/api          Express modular monolith
packages/*        shared-types, config, validation
prisma/           schema, migrations, safe seed
docker/           container build files
docs/             architecture, backlog, ADRs, runbooks
tests/            unit, integration, e2e harness placeholders
```

## Quick start (local)

```bash
cp .env.example .env
docker compose up -d mysql redis
npm install
npm run prisma:generate
npm run prisma:migrate:dev
npm run db:seed
npm run dev:api   # http://localhost:3001/api/v1/health
npm run dev:web   # http://localhost:5173
```

See `docs/runbooks/local-setup.md` for details.

## Scripts

| Script | Purpose |
|---|---|
| `npm run lint` | ESLint |
| `npm run format:check` | Prettier |
| `npm run typecheck` | Strict TypeScript |
| `npm test` | Vitest unit/integration |
| `npm run openapi:validate` | OpenAPI skeleton check |
| `npm run build` | Build packages + API + web |
| `npm run prisma:validate` | Prisma schema validation |

## Agent / contribution rules

- Read `AGENTS.md` before changing code.
- Work one backlog item at a time (`docs/backlog.md`).
- Do not implement Phase 1+ features during M0.
- Do not silently resolve OPEN decisions.
- Contribution conventions: `docs/CONTRIBUTING.md`.

## M0 gate

M0 is a foundation gate, not a product demo. See `docs/M0_ACCEPTANCE_CHECKLIST.md`, `docs/roadmap.md`, and `docs/backlog.md`.
