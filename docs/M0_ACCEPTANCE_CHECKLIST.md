# M0 / Phase 0 Acceptance Checklist

**Gate:** Foundations only  
**Status:** Implementation evidence recorded below. **Owner acceptance still required.**

## A. Repository and conventions

- [x] Repository structure matches the engineering contract.
- [x] Frontend and backend boundaries are explicit.
- [x] Module boundaries are documented.
- [x] Strict TypeScript is enabled.
- [x] Linting passes.
- [x] Formatting passes.
- [x] Commit hooks/contribution conventions are documented.
- [x] No unrelated application feature was introduced.

## B. CI/CD

- [x] Dependency installation works from a clean checkout.
- [x] Secret/static scan passes.
- [x] Lint passes.
- [x] Typecheck passes.
- [x] Unit tests pass.
- [x] Integration-test harness exists and passes its baseline.
- [x] OpenAPI validation is wired.
- [x] Frontend build passes.
- [x] Backend build passes.
- [x] Dependency vulnerability scan is wired.
- [x] Docker build passes.
- [x] Migration validation is wired.
- [x] Playwright smoke-test harness exists where applicable.

## C. Environment and secrets

- [x] local/staging/production boundaries are documented.
- [x] `.env.example` contains names, not secrets.
- [x] Local uses synthetic data only.
- [x] Secrets are absent from source control.
- [x] Secrets are absent from frontend bundles.
- [x] Secrets are absent from logs and test fixtures.

## D. Database

- [x] MySQL 8.x is the database.
- [x] Prisma is configured.
- [x] Migration workflow works from a clean database.
- [x] Applied migrations are treated as immutable.
- [x] Seed scripts are safe and cannot overwrite production business data.
- [x] InnoDB is used for transactional tables.
- [x] UTC timestamp policy is established.
- [x] Opaque public identifiers are established.
- [x] Decimal-money policy is documented.
- [x] FK/constraint strategy is documented.
- [x] Core identity/location/audit foundation is testable.

## E. Gazetteer

- [x] 15-county model is represented.
- [x] County → district → community hierarchy is supported.
- [x] Seed/import mechanism is deterministic.
- [ ] Montserrado community foundation is represented where the baseline requires it. **OPEN — owner chose counties-only seed (option 2).**
- [x] No fabricated geographic data is introduced without source/owner approval.

## F. Auth/RBAC/audit foundation

- [x] Auth module boundary exists.
- [x] RBAC model exists.
- [x] Object-level authorization policy interface exists.
- [x] Session/OTP architecture follows the engineering contract.
- [x] Rate-limit/abuse-control foundation exists.
- [x] Staff/security-sensitive actions have an audit path.
- [x] Audit records are designed as append-only/hash-chained per ADR.

## G. Cloudinary

- [x] Cloudinary adapter exists.
- [x] Signed upload flow is demonstrated.
- [x] API secret never reaches browser code.
- [x] Media metadata validation exists.
- [x] Provider failure has a retryable/recoverable contract.
- [x] Cleanup contract is documented.

## H. API and validation

- [x] `/api/v1` base contract exists.
- [x] OpenAPI skeleton validates.
- [x] Shared Zod validation foundation exists.
- [x] Stable error envelope exists.
- [x] Request ID is included.
- [x] Idempotency approach is documented for material state changes.
- [x] UTC date and decimal-money representation rules are documented.

## I. Observability

- [x] Structured logging exists.
- [x] Request IDs exist.
- [x] Error handling avoids stack-trace leakage.
- [x] Basic metrics/health checks exist.
- [x] Alert/runbook boundaries are documented.
- [x] PII logging policy is enforced.

## J. Performance spike

- [x] SSR/search spike exists.
- [x] Seeded data is used.
- [x] Reference 3G test profile is documented.
- [x] 360px behavior is checked.
- [x] Results are recorded, not merely claimed. **Recorded 2026-10-10 — `runbooks/performance-spike-m0.md` (8–126 ms; ≤ 200 ms budget).**
- [x] Failure to meet the budget is treated as a gate/blocker.

## K. ADR/documentation

- [x] ADR-001 through ADR-014 exist or are explicitly marked not applicable.
- [x] Any changed architectural decision has an ADR.
- [x] No OPEN owner decision was silently resolved.
- [x] README explains how to run the repository.
- [x] Architecture and roadmap are current.
- [x] Backlog reflects actual status.

## L. Scope lock

- [x] No Phase 1 feature was implemented as part of M0 unless explicitly authorized.
- [x] No messaging/reviews/offers/booking/payments/AI/delivery work was introduced.
- [x] No architecture substitution was introduced.
- [x] No speculative infrastructure was introduced.

## Final gate

- [x] All automated checks pass. _(Local 2026-10-10 green: lint, `format:check`, strict typecheck, 23/23 unit + integration tests, `prisma validate`, OpenAPI validation, `prisma migrate deploy` + safe seed on a clean volume, `spike:search` within budget, live `/health`, `/ready`, `/metrics`, `/locations/counties`, `/spike/ssr-search`, `npm audit` (0 vulns), gitleaks (no leaks), and both Docker image builds. Playwright smoke remains unrun locally — its config hardcodes ports 3001/5173 used by another project; needs an owner decision.)_
- [x] M0 evidence is reproducible from a clean checkout. _(Fresh Docker volume → `prisma migrate deploy` → `db:seed` → `spike:search` reproduced 2026-10-10; see `runbooks/performance-spike-m0.md`.)_
- [ ] Owner reviews the gate.
- [ ] Owner explicitly authorizes Phase 1.
