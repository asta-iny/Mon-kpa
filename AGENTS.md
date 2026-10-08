# LibFind — AI Engineering Agent Contract

**Status:** Bootstrap contract  
**Baseline date:** 7 October 2026  
**Applies to:** Cursor, OpenCode, and any AI coding agent operating in this repository.

## 1. Authority and precedence

When sources disagree, use this order:

1. Explicit owner instruction in the current task.
2. `AGENTS.md` and repository-local agent rules.
3. **LibFind Engineering Implementation Specification v1.0** — authoritative engineering contract.
4. **LibFind Production-Grade Product & Engineering Specification v2.0** — authoritative product baseline.
5. Original LibFind specification where still applicable.
6. Engineering inference only when the sources leave a gap.

Never silently replace a higher-precedence decision with a lower-precedence assumption.

### Critical reconciliation

The v2.0 document contains an older architecture recommendation/diagram using PostgreSQL/PostGIS. The separate Engineering Implementation Specification v1.0 explicitly locks **MySQL 8.x** and provides MySQL substitution rules. Therefore:

- Database: **MySQL 8.x**
- ORM: **Prisma**
- Spatial data: MySQL 8 spatial types/functions where supported, plus latitude/longitude
- Search: MySQL FULLTEXT initially
- Media: **Cloudinary**
- Backend: Node.js + TypeScript + Express
- Frontend: React + TypeScript + Tailwind CSS
- Routing: React Router
- Server state: TanStack Query
- Validation/forms: React Hook Form + Zod
- Cache/coordination: Redis
- Jobs: BullMQ
- Phase 2 realtime: Socket.IO + Redis adapter
- API: REST + OpenAPI under `/api/v1`
- Deployment: Docker + managed containers; no Kubernetes requirement at launch
- Architecture: **modular monolith first**

Do not introduce PostgreSQL, MongoDB, Elasticsearch/OpenSearch, Kafka, microservices, or another infrastructure component in Phase 1 merely because it is familiar.

## 2. Mission

Build LibFind as a production-grade, verified local discovery and marketplace platform for Liberia.

Core product loop:

**Find → Verify → Compare → Connect → Transact → Review**

Phase 1 is the verified discovery MVP. Phase 2 adds messaging/reputation. Phase 3 adds transactions. Phase 4 adds grounded AI/fraud intelligence. Phase 5 covers ecosystem/delivery/partner experiments.

## 3. Current execution boundary: M0 / Phase 0 only

Until M0 is explicitly accepted by the owner, agents MUST NOT implement Phase 1 product features.

M0 includes only:

- repository structure and conventions
- TypeScript configuration
- linting/formatting/commit hooks
- CI quality/security/build pipeline
- Docker/local environment
- local/staging/production configuration boundaries
- MySQL + Prisma baseline and migration mechanism
- baseline schema infrastructure
- 15-county gazetteer seed foundation
- auth/RBAC/audit architectural foundation
- Cloudinary integration spike/foundation
- OpenAPI skeleton
- shared Zod validation foundation
- structured logging, request IDs, error handling and observability foundation
- SSR/search performance spike with seeded data
- required ADRs
- documentation/runbooks needed for M0
- tests required to prove the above

Do NOT build listings, public search, favorites, messaging, reviews, offers, booking, payments, AI, promotions, or other Phase 1+ features during M0 unless the owner explicitly changes the scope.

## 4. No-jump rule

Every implementation task must name:

- requirement ID(s)
- phase
- priority
- dependencies
- acceptance criteria
- files/modules expected to change
- DB/API/UI/security/analytics impact as applicable

If a requested task depends on unfinished M0 work, stop at the dependency and report it.

If the user asks for a later-phase feature while an earlier gate is not accepted, do not quietly implement it. Explain the dependency and ask for explicit authorization to change phase scope.

## 5. No-redesign rule

Agents MUST implement the specified architecture, not redesign it.

Forbidden without an approved ADR and explicit owner authorization:

- changing MySQL to PostgreSQL
- replacing Prisma
- changing Express to another backend framework
- changing React/Tailwind/React Router/TanStack Query
- introducing microservices
- introducing a dedicated search engine
- replacing Cloudinary
- replacing Redis/BullMQ
- introducing Kubernetes at launch
- replacing REST/OpenAPI with GraphQL
- changing the API versioning strategy
- changing authentication/session architecture
- changing domain boundaries
- creating a second persistence model for convenience

A measurable technical requirement must justify any proposed architecture change, and the proposal must be documented in an ADR before implementation.

## 6. Module discipline

Use the repository architecture defined by the engineering specification:

```text
libfind/
  apps/
    web/src/
      app/ components/ features/ pages/ routes/ hooks/ services/ lib/
    api/src/
      modules/
      middleware/ infrastructure/ config/ jobs/ realtime/
      app.ts server.ts
  packages/
    shared-types/ validation/ config/
  prisma/
    schema.prisma migrations/ seed/
  docs/
    adr/ api/ runbooks/
  tests/
    e2e/ fixtures/
  docker/
  .github/workflows/
  .env.example
  docker-compose.yml
  README.md
```

Each domain module owns its validation, use cases/services, repositories, and HTTP handlers.

Controllers do not contain business rules.

A module MUST NOT reach directly into another module's persistence implementation.

Preferred flow:

`HTTP Controller → Application Service/Use Case → Domain Rules → Repository/Infrastructure → MySQL/Redis/Cloudinary/external provider`

## 7. Security rules

- Never commit secrets.
- Never put secrets in frontend bundles, logs, fixtures, or documentation.
- Local development uses synthetic data only.
- Production secrets come from the hosting platform's secret store/environment.
- Protected writes require object-level authorization, not just role checks.
- Staff actions affecting trust, verification, moderation, payments, or user data are auditable.
- Material state-changing operations must be idempotent where duplicates can cause harm.
- Error responses must not leak stack traces or sensitive internals.
- Request IDs are required.
- Do not log unnecessary PII.
- Admin/high-risk authentication requirements must not be weakened for convenience.
- Payment functionality remains disabled until provider contracts, legal review, webhook verification and reconciliation tests pass.
- AI, when introduced, is read-only/grounded and cannot override trust or safety decisions.

## 8. Data rules

- MySQL InnoDB for transactional tables.
- UUID/BINARY(16) or an equivalent opaque public identifier strategy; never expose sequential IDs publicly.
- DECIMAL for money; never FLOAT/DOUBLE for monetary values.
- UTC timestamps.
- Foreign keys and database constraints must enforce durable invariants.
- JSON only for genuinely dynamic attributes.
- Every schema change is a checked-in migration.
- Never edit an applied production migration.
- Destructive schema changes require a deprecation/multi-release plan.
- Seeds must never overwrite production business data.

## 9. API rules

- Base path: `/api/v1`
- JSON by default; multipart only when required.
- Bearer access token for protected endpoints as specified by the engineering contract.
- Cursor pagination for public/high-volume collections.
- `Idempotency-Key` for material state-changing endpoints.
- Stable error code + safe message + details + requestId.
- ISO-8601 UTC dates.
- Decimal-safe money representation with explicit currency.
- Breaking API changes require a new version.
- OpenAPI must be updated with contract changes.

## 10. Frontend rules

- Strict TypeScript.
- Feature-oriented modules.
- Mobile-first; core workflows must work at 360px.
- Every async view has loading, empty, error and retry states.
- Every form has validation, server-error handling and submit state.
- Semantic HTML, keyboard navigation, labels, focus states and sufficient contrast.
- Explicit image dimensions/aspect ratios.
- Lazy-load below-the-fold media.
- Never autoplay video.
- TanStack Query owns server state; do not mirror every query in a global store.
- Low-data behavior is a product requirement, not an optional optimization.

## 11. Testing and Definition of Done

No P0 work is complete without acceptance criteria, appropriate automated tests, security controls, observability and documentation.

Minimum CI gates include:

1. dependency installation
2. secret/static scan
3. lint
4. typecheck
5. unit tests
6. integration tests
7. OpenAPI validation
8. frontend/backend builds
9. dependency vulnerability scan
10. Docker build
11. migration validation
12. Playwright smoke tests where applicable

Definition of Ready:

- unique requirement ID and priority
- Given/When/Then acceptance criteria
- roles/permissions identified
- DB/API/UI impact identified
- security/privacy impact identified
- analytics events identified
- dependencies identified
- open decisions resolved or explicitly blocked

Definition of Done:

- implemented in correct module
- automated tests passing
- migration/constraints added where needed
- OpenAPI updated
- responsive/accessibility states implemented
- authorization/rate limits tested
- logs/metrics/errors implemented
- no secret/PII leakage
- performance budget checked
- docs/runbook updated
- review completed

## 12. ADR rule

An ADR is mandatory before changing an architectural decision.

At minimum, the Phase 0 ADR set covers:

- ADR-001 modular monolith
- ADR-002 MySQL 8
- ADR-003 Prisma + migrations
- ADR-004 Cloudinary
- ADR-005 REST + OpenAPI
- ADR-006 Redis + BullMQ
- ADR-007 Socket.IO + Redis adapter for Phase 2
- ADR-008 MapLibre + OpenStreetMap tiles/provider adapter
- ADR-009 payment provider abstraction
- ADR-010 outbox pattern
- ADR-011 soft-delete + retention
- ADR-012 hash-chained append-only audit
- ADR-013 managed containers/no Kubernetes at launch
- ADR-014 grounded AI with validator

Do not reopen an ADR simply because an agent prefers another technology.

## 13. Open decisions

The specifications contain explicit open decisions. Agents MUST NOT silently decide them.

Examples:

- pilot geography/cells
- video policy
- verification staffing/budget
- ownership/authority evidence policy
- legal/privacy/data retention
- payment provider strategy
- map provider final benchmark
- Cloudinary limits/plan
- message retention

When blocked by an OPEN decision, record the blocker; do not fabricate a decision.

## 14. Agent operating protocol

Before coding:

1. Read `AGENTS.md`.
2. Read the applicable roadmap/backlog entry.
3. Read relevant ADRs.
4. Locate the requirement in the supplied specifications.
5. Inspect the existing repository; never assume its state.
6. State the exact bounded task.
7. Implement only that task.
8. Run the relevant tests/checks.
9. Update docs/ADR if the implementation changes a decision.
10. Report files changed, tests run, results, and any remaining blockers.

If the repository already contains code, preserve working behavior unless the bounded task requires changing it.

If an instruction conflicts with these rules, stop and surface the conflict.

## 15. Forbidden agent behaviors

- “While I’m here” refactors.
- Reformatting unrelated files.
- Replacing the stack.
- Building future-phase features proactively.
- Inventing requirements.
- Filling OPEN decisions from personal preference.
- Adding speculative infrastructure.
- Adding dependencies without justification.
- Removing tests to make CI pass.
- Weakening validation/security to make a flow work.
- Using mock/stub behavior as if it were production functionality.
- Marking work complete without running acceptance checks.
- Claiming an external integration works without verifying the actual contract.
