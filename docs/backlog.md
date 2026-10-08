# LibFind Backlog

## Backlog operating rule

Work in dependency order. Each task is bounded and must satisfy Definition of Ready before implementation.

### EPIC-00 — Foundation

**Depends on:** none  
**Output:** repo, CI, Docker, conventions.

- [x] M0-001 Repository structure and package/workspace conventions
- [x] M0-002 TypeScript strict configuration
- [x] M0-003 Lint/format/commit hooks
- [x] M0-004 CI quality/security/build pipeline
- [x] M0-005 Docker/local development environment
- [x] M0-006 Environment/secrets configuration contract
- [x] M0-007 Baseline logging/request ID/error handling
- [x] M0-008 Observability foundation
- [x] M0-009 ADR baseline and architecture docs
- [x] M0-010 SSR/search performance spike

### EPIC-01 — Database

**Depends on:** EPIC-00  
**Output:** MySQL schema, migrations, seeds, indexes, tests.

- [x] M0-011 Prisma/MySQL baseline
- [x] M0-012 migration workflow and CI validation
- [x] M0-013 core identity/role/permission/session/OTP tables
- [x] M0-014 location tables and 15-county seed foundation _(districts/communities OPEN)_
- [x] M0-015 audit schema foundation
- [x] M0-016 database test fixtures and seed safety

### EPIC-02 — Auth/RBAC

**Depends on:** EPIC-01  
**Output:** OTP, sessions, roles, permissions, abuse controls.

M0 is limited to the architectural/foundation portion. Full product authentication behavior is Phase 1.

- [x] M0-017 auth module skeleton
- [x] M0-018 authorization middleware skeleton
- [x] M0-019 object-authorization policy interfaces
- [x] M0-020 audit integration
- [x] M0-021 rate-limit/abuse-control foundation

### EPIC-03 — Locations/Categories

**Depends on:** EPIC-01  
**Output:** seed/API foundation.

M0:

- [x] M0-022 gazetteer import/seed mechanism
- [x] M0-023 location hierarchy validation
- [x] M0-024 category registry schema/foundation

Phase 1:

- REQ-LOC-001
- REQ-CAT-001

### EPIC-04 — Cloudinary

**Depends on:** EPIC-01  
**Output:** signed upload foundation, metadata validation, transformation/cleanup interfaces.

M0:

- [x] M0-025 Cloudinary provider adapter
- [x] M0-026 signed-upload spike
- [x] M0-027 media metadata validation
- [x] M0-028 failure/retry contract
- [x] M0-029 cleanup contract

### EPIC-05 — Listings

**Depends on:** EPIC-02–04  
**Phase:** 1

- REQ-LST-001
- lifecycle/state machine
- media requirements
- ownership checks

### EPIC-06 — Search

**Depends on:** EPIC-03, EPIC-05  
**Phase:** 1

- REQ-SRCH-001
- FULLTEXT
- filters
- cursor pagination
- ranking
- performance tests

### EPIC-07 — Trust/Safety

**Depends on:** EPIC-02, EPIC-05  
**Phase:** 1

- REQ-VER-001
- REQ-RPT-001
- REQ-MOD-001
- audit and evidence controls

### EPIC-08 — Contact/Notifications

**Depends on:** EPIC-02, EPIC-05  
**Phase:** 1

- REQ-CON-001
- REQ-NOT-001

### EPIC-09 — Business/User tools

**Depends on:** EPIC-02, EPIC-05  
**Phase:** 1

- REQ-BUS-001
- REQ-FAV-001
- REQ-DASH-001
- REQ-LQS-001
- REQ-MAP-001

### EPIC-10 — SEO/Performance

**Depends on:** EPIC-05–09  
**Phase:** 1

- REQ-SEO-001
- PWA
- low-data mode
- performance gates

### EPIC-11 — Messaging/Reputation

**Depends on:** EPIC-08–10  
**Phase:** 2

- REQ-MSG-001
- REQ-REV-001
- saved searches/alerts
- identity verification
- agent tools

### EPIC-12 — Transactions

**Depends on:** EPIC-11  
**Phase:** 3

- REQ-OFR-001
- REQ-BKG-001
- REQ-PAY-001
- disputes
- ledger/reconciliation

## Task template

```text
Task ID:
Requirement IDs:
Phase/Priority:
Goal:
Dependencies:
Expected modules/files:
Database impact:
API impact:
UI impact:
Security impact:
Analytics events:
Acceptance criteria:
Tests:
Observability:
Documentation:
Definition of Done:
```

## Stop conditions

Stop instead of coding if:

- requirement ID is missing
- acceptance criteria are unclear
- an OPEN decision blocks the work
- a dependency is incomplete
- requested implementation changes a locked architecture decision
- the work belongs to a later phase without explicit authorization
