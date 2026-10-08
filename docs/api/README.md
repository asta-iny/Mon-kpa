# API documentation

- Base path: `/api/v1`
- Contract: `apps/api/src/openapi/openapi.yaml`
- Style: REST + OpenAPI (ADR-005)

## Conventions

- ISO-8601 UTC timestamps
- Money: decimal **string** + currency (`LRD` \| `USD`) — never float
- Opaque UUID public IDs
- Stable error envelope: `{ error: { code, message, details?, requestId } }`
- `X-Request-Id` on responses
- **Idempotency-Key** required for material state-changing endpoints when introduced in Phase 1+ (offers, payments, etc.). M0 auth/media writes are foundation spikes; prefer client retries only where handlers are idempotent (OTP consume is single-use).

## M0 routes

Health/ready/metrics, auth foundation + OTP skeleton, counties, categories, media sign/metadata, SSR search spike.

Phase 1 product endpoints are intentionally absent.
