# LibFind Architecture

## 1. Architecture decision

LibFind starts as a **modular monolith**. The engineering contract explicitly rejects premature microservices and speculative infrastructure.

## 2. System shape

```text
Browser / PWA
    |
    v
Web application (React + TypeScript + Tailwind)
    |
    v
REST API /api/v1
    |
    v
Express modular monolith
    |
    +--> Domain modules
    |      auth
    |      users
    |      locations
    |      categories
    |      listings
    |      media
    |      search
    |      contacts
    |      favorites
    |      businesses
    |      verification
    |      notifications
    |      moderation
    |      reports
    |      analytics
    |      messaging       [Phase 2]
    |      reviews         [Phase 2]
    |      offers          [Phase 3]
    |      bookings        [Phase 3]
    |      payments        [Phase 3]
    |      disputes        [Phase 3]
    |      promotions      [Phase 3]
    |
    +--> MySQL 8 / Prisma
    +--> Redis
    +--> BullMQ workers
    +--> Cloudinary
    +--> external providers via adapters
```

## 3. Layering

Every domain follows:

`HTTP Controller → Application Service/Use Case → Domain Rules → Repository/Infrastructure → persistence/provider`

Controllers must not own business rules.

Modules must not reach into another module's persistence implementation.

## 4. Persistence

MySQL 8.x is the relational source of truth.

Rules:

- InnoDB
- opaque IDs
- UTC timestamps
- DECIMAL for money
- FK/DB constraints
- typed core fields
- JSON only for genuinely dynamic attributes
- FULLTEXT for initial title/description search
- spatial types/functions only where supported, with latitude/longitude retained
- EXPLAIN important queries before production

## 5. Media

Cloudinary is authoritative for media binaries.

Upload pattern:

1. authenticated client requests upload configuration
2. API checks ownership/permission and limits
3. browser uploads directly to Cloudinary
4. Cloudinary returns metadata
5. client submits metadata to API
6. API validates and stores media metadata
7. background jobs process cleanup/follow-up
8. public pages use responsive transformations

The Cloudinary API secret must never reach the browser.

## 6. Search

Phase 1 search uses MySQL filtering + FULLTEXT. A dedicated search engine is not a launch dependency.

Ranking considers, where applicable:

- availability/freshness
- verification
- relevance
- quality/completeness
- recency
- distance
- promotion only in Phase 3 and never as a trust bypass

## 7. Authentication and authorization

Phone OTP is the Phase 1 authentication flow:

1. normalize phone
2. create short-lived OTP challenge
3. store only secure hash
4. enforce resend/attempt/IP/device/account limits
5. verify and consume atomically
6. issue short-lived access token and rotating refresh token
7. refresh-token reuse revokes the affected session family

RBAC is insufficient by itself. Protected endpoints also check ownership, business membership, or explicit object permission.

## 8. Audit and trust

Verification, moderation, privileged staff actions and financial events are auditable.

Audit records are append-only and hash-chained per the ADR decision.

Verification evidence is access-controlled and is never exposed in public listing payloads.

## 9. Async work

BullMQ + Redis handles:

- notifications
- expiry
- media follow-up
- analytics
- risk jobs
- other bounded asynchronous work

Socket.IO + Redis adapter is a Phase 2 concern.

## 10. Environments

| Environment | Purpose                     | Data                                       |
| ----------- | --------------------------- | ------------------------------------------ |
| local       | development/agent execution | synthetic only                             |
| staging     | QA/UAT                      | synthetic or explicitly approved test data |
| production  | live                        | real data, privileged controls             |

Secrets must never enter source control, frontend bundles, logs or fixtures.

## 11. Performance

The product is mobile-first and low-data by design.

Foundation work must include the SSR/search performance spike. Production targets include the reference 3G budget and core workflows at 360px.

Use Cloudinary thumbnails, no video autoplay, controlled prefetch, retryable uploads and a data-saver preference.

## 12. Phase boundaries

Do not use architecture work as an excuse to implement future business features.

Phase 0 proves the platform foundation. Phase 1 proves verified discovery. Phase 2 proves messaging/reputation. Phase 3 proves transactions. Phase 4 proves grounded AI/fraud intelligence. Phase 5 covers ecosystem experiments.
