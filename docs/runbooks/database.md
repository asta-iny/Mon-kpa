# Database policies (M0)

## Engine and ORM

- MySQL 8.x, InnoDB for transactional tables
- Prisma with checked-in migrations (immutable once applied in production)

## Identifiers

- Public/opaque IDs are UUID strings stored as `CHAR(36)`
- Never expose sequential autoincrement IDs publicly (`AuditEvent.seq` is internal only)

## Time

- All timestamps are UTC (`DateTime(3)`)

## Money

- Use `DECIMAL` (Prisma `Decimal`) for monetary amounts when Phase 3 lands
- API representation: decimal **string** + explicit currency (`LRD` | `USD`)
- Never use FLOAT/DOUBLE for money

## Foreign keys

- Hierarchy and ownership invariants are enforced with FKs
- Soft-delete via `deletedAt` where retention requires tombstones (ADR-011)

## Seeds

- Refuse `APP_ENV=production`
- Staging requires `ALLOW_STAGING_SEED=true`
- Gazetteer: official **15 counties** only; district/community **OPEN**
- Local fixtures are synthetic only
