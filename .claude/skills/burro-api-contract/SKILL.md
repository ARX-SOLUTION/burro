---
name: burro-api-contract
description: Use when creating, changing, or reviewing Burro HTTP API contracts, DTOs, guards, validation, response envelopes, or shared client/server types.
---

# Burro API Contract

Read first:
- `docs/04-API_SPEC.md`
- `docs/03-DATABASE_SCHEMA.md` when persistence changes
- `docs/05-PERMISSION_MATRIX.md` when auth/RBAC changes
- `packages/shared/src`
- target files in `apps/backend/src`

Rules:
1. Do not invent undocumented endpoints or fields.
2. Put shared request/response contracts in `packages/shared`.
3. Validate input at the boundary.
4. Keep response envelopes stable.
5. Update docs when behavior changes.
6. Run the narrowest backend test/typecheck/build command.

Report:
- Contract changed or unchanged
- Files touched
- Validation command and result
- Remaining risk
