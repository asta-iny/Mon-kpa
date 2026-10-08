# ADR 014 GROUNDED AI VALIDATOR: Grounded AI with validator

- **Status:** Accepted baseline
- **Date:** 2026-10-07
- **Scope:** Phase 0 / applicable later phases

## Context

This decision is part of the LibFind Phase 0 architecture baseline. The two supplied specifications contain the product and engineering constraints for implementation.

## Decision

AI may only operate through read-only validated tools and database-backed facts. It cannot invent listing facts or override trust/safety decisions.

## Alternatives rejected

See the LibFind architecture decision register and engineering implementation contract. An agent may not replace this decision based on preference.

## Consequences

The repository must implement the decision consistently. A later change requires a new or superseding ADR, a measurable reason, and explicit owner authorization.

## Security / privacy impact

Any implementation must preserve the security, auditability, data minimization, authorization and secret-management rules in `AGENTS.md`.

## Revisit trigger

Only the trigger stated in the source architecture decision register, or an explicit owner decision, may reopen this ADR.

## Evidence

LibFind Engineering Implementation Specification v1.0, architecture/ADR sections; LibFind Production-Grade Product & Engineering Specification v2.0, §69 decision register where applicable.
