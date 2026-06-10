---
name: burro-context-plan
description: Use when planning Burro work, choosing which docs/files to load, decomposing a change, reducing Claude token usage, or preparing a beads-backed execution plan.
---

# Burro Context Plan

Use this as the planning router for Burro work.

Procedure:
1. Run `bd prime` if session workflow context is missing.
2. Use beads for task state; do not create markdown task lists.
3. Read `docs/00-INDEX.md` and `docs/08-CONTEXT.md`.
4. Pick the smallest domain pack:
   - Backend/API: `docs/04-API_SPEC.md`, `docs/03-DATABASE_SCHEMA.md`, `apps/backend`, `packages/shared`.
   - Frontend/UI: `docs/12-FIGMA_FLOW_DESIGN.md`, `docs/13-STUDENT_FLOW_IMPLEMENTATION.md`, target app, `packages/ui`.
   - Security/RBAC: `docs/05-PERMISSION_MATRIX.md`, auth/session code, target endpoint.
   - Deployment: `docs/07-DEPLOYMENT.md`, `ecosystem.config.cjs`, target package scripts.
5. State objective, scope, risk, validation, rollback, and done condition.

Token rules:
- Prefer `rg` and short line ranges.
- Delegate noisy read-only research to `burro-context-scout`.
- Keep summaries factual and reference-backed.
