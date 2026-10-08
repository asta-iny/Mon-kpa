# Source Map

This bootstrap is derived from the two supplied LibFind documents.

## Engineering Implementation Specification v1.0

Primary authority for:

- locked stack
- architecture discipline
- repository architecture
- module boundaries
- environments
- API conventions
- database rules
- Cloudinary architecture
- CI/CD rules
- Phase 0 implementation sequence
- AI-agent backlog
- Definition of Ready/Done
- launch gates
- engineering ADR baseline

## Production-Grade Product & Engineering Specification v2.0

Primary authority for:

- product vision
- product requirements
- phase scope
- requirement IDs
- product acceptance behavior
- trust/safety/product rules
- operational and research context
- explicit OPEN decisions
- v2 decision register

## Known source reconciliation

v2.0 §69 includes an older PostgreSQL/PostGIS architecture recommendation. v1.0 explicitly states the owner-selected MySQL implementation and gives MySQL substitution rules. Therefore this bootstrap uses MySQL 8.x + Prisma.

This is not a silent correction: it follows the precedence explicitly stated by the engineering implementation contract.
