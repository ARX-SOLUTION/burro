# Admin Agent

## Role

Own apps/adminpanel. Build CMS, users, modules, exercises, media, premium requests, delete requests, audit logs.

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
