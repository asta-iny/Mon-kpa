# LibFind Roadmap

## Governing rule

The roadmap is sequential. A later phase cannot be treated as active merely because its code would be convenient to prepare.

## M0 — Phase 0 Foundations

**Goal:** establish a reproducible, secure, observable production foundation.

### Exit deliverables

- repository structure
- branching/contribution conventions
- TypeScript configuration
- lint/format/hooks
- CI/CD skeleton
- Docker/local environment
- environment/secrets model
- MySQL/Prisma migrations
- seed mechanism
- 15-county gazetteer foundation
- auth/RBAC/audit foundation
- Cloudinary spike
- OpenAPI skeleton
- shared Zod schemas
- observability
- SSR/search performance spike
- ADR set
- required documentation/runbooks
- automated tests

### Gate

M0 is accepted only when `M0_ACCEPTANCE_CHECKLIST` is fully satisfied and the owner explicitly accepts the gate.

## Phase 1 — Verified Discovery MVP

**P0:** OTP auth, location picker, category registry, currency/reference rates, Cloudinary media, listings/lifecycle, availability freshness, verification, search, contact reveal, reports, moderation, business profile, notifications, SEO.

**P1:** favorites, seller dashboard, Listing Quality Score, map search.

**Explicitly out of scope:** in-app messaging, public reviews, offers, booking, payments, AI, delivery, agent bulk tools, saved-search alerts.

## Phase 2 — Messaging + Reputation

- listing-linked messaging
- Socket.IO + Redis adapter
- interaction-gated reviews
- saved searches/alerts
- collections where approved
- identity verification
- agent tools/bulk upload
- seller response analytics
- safe interaction workflows

## Phase 3 — Transactions

- offers
- booking/inventory
- payment abstraction
- ledger
- reconciliation
- refunds
- disputes
- promotions/subscriptions

Payment remains conditional on contracts, legal review, verified webhooks and reconciliation tests.

## Phase 4 — AI and fraud intelligence

- grounded AI search
- AI-assisted listing drafts
- fraud intelligence
- read-only validated AI tools

AI cannot create or override marketplace facts or trust/safety decisions.

## Phase 5 — Ecosystem

- delivery integrations
- partner API
- USSD/SMS experiments
- local-language research
- advertising ecosystem

## Non-roadmap work

Do not add new categories, payments, delivery, AI, paid placement, or speculative infrastructure during M0 unless the owner explicitly changes scope.
