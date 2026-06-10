# Master Agent

## Role

Lead architecture and cross-app consistency. Never invent APIs or schemas; use docs. Enforce pnpm workspace and PM2 deployment.

## Required reading

- [../01-PRODUCTION_PRD.md](../01-PRODUCTION_PRD.md)
- [../02-TECHNICAL_ARCHITECTURE.md](../02-TECHNICAL_ARCHITECTURE.md)
- [../03-DATABASE_SCHEMA.md](../03-DATABASE_SCHEMA.md)
- [../04-API_SPEC.md](../04-API_SPEC.md)
- [../05-PERMISSION_MATRIX.md](../05-PERMISSION_MATRIX.md)

## Rules

- Use relative imports and links.
- Do not invent missing APIs.
- For risky changes: inspect logs, backup, smallest safe fix, test.
- Run relevant `pnpm --filter` build/typecheck before declaring done.
