# Agent Operating Model

This file is the shared operating contract for Burro agents, Claude Code subagents, and project skills.

## Objective

Keep the main conversation small while preserving correctness. Agents should load only the context needed for the current decision, push noisy exploration into subagents, and return compact evidence-backed summaries.

## Context order

1. `bd prime` for workflow rules and project memory.
2. `docs/00-INDEX.md` and `docs/08-CONTEXT.md`.
3. The domain pack for the task.
4. The exact source files being changed.
5. Recent tool results and validation output.

## Domain packs

Backend/API:
- `docs/04-API_SPEC.md`
- `docs/03-DATABASE_SCHEMA.md`
- `docs/05-PERMISSION_MATRIX.md`
- `apps/backend/src`
- `packages/shared/src`

Student/UI:
- `docs/12-FIGMA_FLOW_DESIGN.md`
- `docs/13-STUDENT_FLOW_IMPLEMENTATION.md`
- `docs/10-UI_UX_SPEC.md`
- `apps/students`
- `packages/ui/src`

Realtime/notifications:
- `docs/06-WEBSOCKET_EVENTS.md`
- `docs/04-API_SPEC.md`
- backend gateway, queue, and notification modules

Deployment:
- `docs/07-DEPLOYMENT.md`
- `ecosystem.config.cjs`
- package scripts and environment examples

## Agent graph

- Master/architect coordinates cross-app contracts and asks other agents for focused evidence.
- Backend owns API, persistence, services, queues, auth, and realtime.
- Frontend owns app routes, UI state, Telegram mobile ergonomics, and shared UI usage.
- Database owns schema, migration safety, indexes, and data preservation.
- QA/security owns regression risk, permissions, privacy, abuse cases, and verification.
- DevOps owns build, backup, deployment, PM2, health checks, and rollback.

## Planning contract

For non-trivial work, state:
- objective
- included scope
- excluded scope
- risk level
- affected domain pack
- validation command
- rollback or recovery path
- beads issue id

Avoid markdown task lists for tracking. Progress belongs in beads.

## Handoff contract

When handing work to another agent or after compaction, preserve:
- current objective and beads issue id
- files inspected and changed
- key invariants
- validation already run
- blockers and exact errors
- next concrete action

## Token controls

- Use `burro-context-scout` for broad read-only discovery.
- Use `burro-reviewer` for post-change reviews.
- Use project skills under `.claude/skills` instead of repeating procedures in chat.
- Keep hook-injected context short and route-oriented.
- Store telemetry and local hook state under `.claude/state/`, which is gitignored.
