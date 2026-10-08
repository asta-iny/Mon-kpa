# M0 / Phase 0 Acceptance Checklist

**Gate:** Foundations only  
**Status:** Not accepted until every applicable item is proven.

## A. Repository and conventions

- [ ] Repository structure matches the engineering contract.
- [ ] Frontend and backend boundaries are explicit.
- [ ] Module boundaries are documented.
- [ ] Strict TypeScript is enabled.
- [ ] Linting passes.
- [ ] Formatting passes.
- [ ] Commit hooks/contribution conventions are documented.
- [ ] No unrelated application feature was introduced.

## B. CI/CD

- [ ] Dependency installation works from a clean checkout.
- [ ] Secret/static scan passes.
- [ ] Lint passes.
- [ ] Typecheck passes.
- [ ] Unit tests pass.
- [ ] Integration-test harness exists and passes its baseline.
- [ ] OpenAPI validation is wired.
- [ ] Frontend build passes.
- [ ] Backend build passes.
- [ ] Dependency vulnerability scan is wired.
- [ ] Docker build passes.
- [ ] Migration validation is wired.
- [ ] Playwright smoke-test harness exists where applicable.

## C. Environment and secrets

- [ ] local/staging/production boundaries are documented.
- [ ] `.env.example` contains names, not secrets.
- [ ] Local uses synthetic data only.
- [ ] Secrets are absent from source control.
- [ ] Secrets are absent from frontend bundles.
- [ ] Secrets are absent from logs and test fixtures.

## D. Database

- [ ] MySQL 8.x is the database.
- [ ] Prisma is configured.
- [ ] Migration workflow works from a clean database.
- [ ] Applied migrations are treated as immutable.
- [ ] Seed scripts are safe and cannot overwrite production business data.
- [ ] InnoDB is used for transactional tables.
- [ ] UTC timestamp policy is established.
- [ ] Opaque public identifiers are established.
- [ ] Decimal-money policy is documented.
- [ ] FK/constraint strategy is documented.
- [ ] Core identity/location/audit foundation is testable.

## E. Gazetteer

- [ ] 15-county model is represented.
- [ ] County → district → community hierarchy is supported.
- [ ] Seed/import mechanism is deterministic.
- [ ] Montserrado community foundation is represented where the baseline requires it.
- [ ] No fabricated geographic data is introduced without source/owner approval.

## F. Auth/RBAC/audit foundation

- [ ] Auth module boundary exists.
- [ ] RBAC model exists.
- [ ] Object-level authorization policy interface exists.
- [ ] Session/OTP architecture follows the engineering contract.
- [ ] Rate-limit/abuse-control foundation exists.
- [ ] Staff/security-sensitive actions have an audit path.
- [ ] Audit records are designed as append-only/hash-chained per ADR.

## G. Cloudinary

- [ ] Cloudinary adapter exists.
- [ ] Signed upload flow is demonstrated.
- [ ] API secret never reaches browser code.
- [ ] Media metadata validation exists.
- [ ] Provider failure has a retryable/recoverable contract.
- [ ] Cleanup contract is documented.

## H. API and validation

- [ ] `/api/v1` base contract exists.
- [ ] OpenAPI skeleton validates.
- [ ] Shared Zod validation foundation exists.
- [ ] Stable error envelope exists.
- [ ] Request ID is included.
- [ ] Idempotency approach is documented for material state changes.
- [ ] UTC date and decimal-money representation rules are documented.

## I. Observability

- [ ] Structured logging exists.
- [ ] Request IDs exist.
- [ ] Error handling avoids stack-trace leakage.
- [ ] Basic metrics/health checks exist.
- [ ] Alert/runbook boundaries are documented.
- [ ] PII logging policy is enforced.

## J. Performance spike

- [ ] SSR/search spike exists.
- [ ] Seeded data is used.
- [ ] Reference 3G test profile is documented.
- [ ] 360px behavior is checked.
- [ ] Results are recorded, not merely claimed.
- [ ] Failure to meet the budget is treated as a gate/blocker.

## K. ADR/documentation

- [ ] ADR-001 through ADR-014 exist or are explicitly marked not applicable.
- [ ] Any changed architectural decision has an ADR.
- [ ] No OPEN owner decision was silently resolved.
- [ ] README explains how to run the repository.
- [ ] Architecture and roadmap are current.
- [ ] Backlog reflects actual status.

## L. Scope lock

- [ ] No Phase 1 feature was implemented as part of M0 unless explicitly authorized.
- [ ] No messaging/reviews/offers/booking/payments/AI/delivery work was introduced.
- [ ] No architecture substitution was introduced.
- [ ] No speculative infrastructure was introduced.

## Final gate

- [ ] All automated checks pass.
- [ ] M0 evidence is reproducible from a clean checkout.
- [ ] Owner reviews the gate.
- [ ] Owner explicitly authorizes Phase 1.
