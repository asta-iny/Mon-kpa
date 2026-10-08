# Observability (M0)

## Logging

- Structured JSON logs via Pino
- Every request carries `X-Request-Id` / `requestId`
- Secrets and auth material are redacted (authorization, tokens, OTP, Cloudinary secret, DB URL)
- Do not log raw phone OTP codes outside explicit local/test response fields
- Prefer hashed IP (`request_ip_hash`) over raw IP in durable storage

## Health

| Endpoint              | Purpose                                 |
| --------------------- | --------------------------------------- |
| `GET /api/v1/health`  | Liveness                                |
| `GET /api/v1/ready`   | Readiness (DB required; Redis reported) |
| `GET /api/v1/metrics` | Prometheus text metrics                 |

## Alert boundaries (later wiring)

Alert when:

- readiness fails for > 2 minutes
- 5xx rate exceeds budget
- migration job fails in CI/CD
- Cloudinary cleanup permanent-failure spike

Do not alert on single 404s or client validation errors.

## PII

Minimize PII in logs. Phone numbers in logs should be avoided; use opaque user IDs.
