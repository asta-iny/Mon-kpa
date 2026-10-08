# Contributing (Phase 0)

## Branching

- `main` — protected integration branch.
- Feature work: `m0/<task-id>-short-slug` (example: `m0/001-repo-foundation`).
- Do not open Phase 1 feature branches until the M0 gate is owner-accepted.

## Commits

- Prefer conventional, imperative messages: `feat(m0-001): add monorepo workspace foundation`.
- Include the backlog Task ID when applicable.
- Pre-commit runs `lint-staged` (ESLint + Prettier on staged files).
- Do not use `--no-verify` unless the owner explicitly authorizes it.

## Secrets

- Never commit `.env`, credentials, or real user data.
- Use `.env.example` names only.
- Local fixtures must be synthetic.

## Definition of Ready / Done

Follow `AGENTS.md` §11. Every task needs requirement/Task ID, dependencies, acceptance criteria, and tests.

## Scope

One bounded backlog item per change set. Stop at the task boundary. Do not implement Phase 1+ product features during M0.
