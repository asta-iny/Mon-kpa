You are the implementation agent for the LibFind repository.

Before changing anything, read and obey:
1. `AGENTS.md`
2. `README.md`
3. `docs/architecture.md`
4. `docs/roadmap.md`
5. `docs/backlog.md`
6. `docs/M0_ACCEPTANCE_CHECKLIST.md`
7. all `docs/adr/ADR-*.md`

You are operating under the LibFind Engineering Implementation Specification v1.0 and LibFind Production-Grade Product & Engineering Specification v2.0.

## CRITICAL ARCHITECTURE RULE

The engineering specification v1.0 explicitly locks:
- React + TypeScript + Tailwind CSS
- React Router
- TanStack Query
- React Hook Form + Zod
- Node.js + TypeScript + Express
- REST + OpenAPI under `/api/v1`
- MySQL 8.x
- Prisma
- Redis
- BullMQ
- Socket.IO + Redis adapter for Phase 2
- Cloudinary
- Docker + managed containers
- modular monolith first

The v2.0 document contains an older PostgreSQL/PostGIS architecture diagram. DO NOT adopt PostgreSQL/PostGIS. The engineering specification's MySQL decision is authoritative for implementation.

## YOUR TASK

Perform **M0-001: Repository and Foundation Audit + Minimal Bootstrap** only.

Do NOT build any Phase 1 product feature.

### Step 1 — Inspect before editing

Inspect the current repository and report:

- current directory tree relevant to the architecture
- package manager/workspace state
- existing frontend/backend structure
- existing database/Prisma state
- existing CI
- existing Docker files
- existing environment files
- existing tests
- existing documentation
- existing architecture deviations
- whether the repository is empty, partial, or already implemented

Do not assume the repository is empty.

### Step 2 — Compare against the contract

Create a concise gap report mapped to:

- M0 backlog IDs
- locked technology stack
- architecture layers
- environment/secrets rules
- CI gates
- testing gates
- observability requirements
- ADR requirements

Do not fix gaps yet unless they are strictly required for the minimal M0 bootstrap.

### Step 3 — Implement only the minimum M0 foundation

If the repository is missing the foundation, implement only the bounded M0 foundation needed for:

- repository conventions
- strict TypeScript baseline
- lint/format baseline
- CI baseline
- Docker/local baseline
- environment configuration contract
- MySQL + Prisma baseline
- migration mechanism
- safe seed mechanism
- baseline logging/request ID/error handling
- OpenAPI skeleton
- shared Zod validation foundation
- ADR/documentation structure

Do not implement:
- listing creation/editing
- public search
- favorites
- messaging
- reviews
- offers
- booking
- payments
- AI
- promotions
- delivery
- public marketplace workflows
- future-phase UI

### Step 4 — Preserve existing work

If the repository already has implementation:

- do not rewrite it wholesale
- do not replace working architecture for stylistic reasons
- do not perform unrelated refactors
- preserve existing tests
- make the smallest changes needed to bring the repository into M0 alignment

### Step 5 — Security

Verify that:
- no secrets are committed
- `.env.example` contains names only
- secrets cannot reach frontend bundles
- local data is synthetic
- error handling does not leak stack traces
- request IDs exist
- authorization foundations are not bypassed

### Step 6 — Tests and checks

Run the checks that are applicable to the current repository:

- install/dependency check
- lint
- typecheck
- unit/integration baseline
- OpenAPI validation
- frontend/backend build
- Docker build
- Prisma migration validation
- secret/static scan if available

Do not remove or weaken checks to make them pass.

### Step 7 — Stop at M0

Do not continue into the next backlog item automatically.

At the end, report:

1. what you inspected
2. what you changed
3. exact files changed
4. commands/tests run
5. results
6. remaining M0 gaps
7. blockers/Open decisions
8. whether M0 can be accepted yet

If M0 is not fully complete, say **M0 NOT READY FOR ACCEPTANCE**.

If M0 is complete, say **M0 READY FOR OWNER ACCEPTANCE**.

Do not claim owner acceptance yourself.

## HARD STOP RULES

Stop and ask for clarification instead of guessing if:
- an instruction conflicts with `AGENTS.md`
- an OPEN decision is required
- a requested change would alter a locked architecture decision
- the task would require Phase 1+ functionality
- the repository state makes safe migration uncertain
- an external provider contract is required but unavailable

Remember: **one bounded task, then stop.**
