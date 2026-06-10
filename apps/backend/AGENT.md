# Backend API Agent

## Scope

Work only inside `apps/backend` unless the task explicitly requires shared package changes.

## Required context

Read in this order:

1. [../../docs/00-INDEX.md](../../docs/00-INDEX.md)
2. [../../docs/01-PRODUCTION_PRD.md](../../docs/01-PRODUCTION_PRD.md)
3. [../../docs/02-TECHNICAL_ARCHITECTURE.md](../../docs/02-TECHNICAL_ARCHITECTURE.md)
4. [../../docs/05-PERMISSION_MATRIX.md](../../docs/05-PERMISSION_MATRIX.md)

## Do not modify

- unrelated apps
- database schema without checking [../../docs/03-DATABASE_SCHEMA.md](../../docs/03-DATABASE_SCHEMA.md)
- API contracts without checking [../../docs/04-API_SPEC.md](../../docs/04-API_SPEC.md)

## Quality gates

```bash
pnpm --filter @burro/backend typecheck
pnpm --filter @burro/backend build
```
