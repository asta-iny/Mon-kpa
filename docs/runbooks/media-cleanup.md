# Media cleanup contract (M0)

Cloudinary holds binaries; MySQL stores metadata only (ADR-004).

## Flow

1. Staff/system requests cleanup with `publicId`.
2. Adapter calls Cloudinary `destroy`.
3. On success, mark `media_assets.status=deleted` and set `deleted_at`.
4. On `retryable` failure (timeout/network/429), re-queue with incremented `attempt` (BullMQ worker in a later M0/ops pass).
5. On `permanent` failure, stop and record audit/error; do not infinite-loop.

## Secrets

`CLOUDINARY_API_SECRET` is server-only. Signed upload params are produced by the API; browsers upload directly to Cloudinary without the secret.
