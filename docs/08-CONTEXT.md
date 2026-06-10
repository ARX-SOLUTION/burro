# Burro Context

## Product

Burro Fonetika is an Arabic phonetics learning platform for children aged 4–14.

## Architecture

- apps/students: Student app
- apps/parents: Parent app
- apps/adminpanel: Admin CMS
- apps/backend: API
- packages/shared: shared types
- packages/ui: shared UI

## Core decisions

- pnpm workspace
- PM2 deployment
- NestJS + Fastify
- PostgreSQL + Drizzle
- Vite + React + TypeScript + Tailwind
- Socket.IO realtime
- BullMQ notifications
- Redis cache/queue
- App-level RBAC, no RLS in MVP
- 60 modules full course
- 10 modules launch content
- Modules 1–3 free
- Modules 4–60 premium
- Premium admin controlled
- Parent max 2 per student
- Student generates parent invite
- Admin-only unlink
- Soft delete only

## Exercise types

- find_letter
- find_sound
- listen_find_letter
- listen_find_sound

## Attempt

An Attempt is one run of a lesson module's exercises by a student in one mode (practice or final_quiz). The Attempt owns hearts, answer finality, XP idempotency, and pass/fail (≥ 80%). Contract: `@burro/shared` contracts/attempts; rules: backend attempts module.

## Gamification

- XP ledger
- Active Days
- Fixed achievements
- Leaderboards
- Final quiz hearts

## Critical rule

Progress belongs to student. Premium controls access only. Never delete educational progress due to premium, block, or soft delete.

## Agent context contract

Agents must keep context small and source-backed.

Startup context:
- `bd prime`
- [00-INDEX.md](00-INDEX.md)
- this file
- [agents/OPERATING_MODEL.md](agents/OPERATING_MODEL.md) when coordinating agents or subagents

Domain context is loaded only when needed:
- Backend/API: [04-API_SPEC.md](04-API_SPEC.md), [03-DATABASE_SCHEMA.md](03-DATABASE_SCHEMA.md), [05-PERMISSION_MATRIX.md](05-PERMISSION_MATRIX.md), `apps/backend`, `packages/shared`
- Student/UI: [12-FIGMA_FLOW_DESIGN.md](12-FIGMA_FLOW_DESIGN.md), [13-STUDENT_FLOW_IMPLEMENTATION.md](13-STUDENT_FLOW_IMPLEMENTATION.md), `apps/students`, `packages/ui`
- Realtime: [06-WEBSOCKET_EVENTS.md](06-WEBSOCKET_EVENTS.md), backend gateway and notification code
- Deployment: [07-DEPLOYMENT.md](07-DEPLOYMENT.md), `ecosystem.config.cjs`, package scripts

Token-saving rules:
- Prefer `rg` and short line ranges.
- Use project skills in `../.claude/skills` for repeatable procedures.
- Use `burro-context-scout` for broad read-only research.
- Return compact summaries with exact file references instead of pasting raw logs.
- Keep hook-injected context to routing hints and invariants, not full docs.

## Claude Code integrations

Project configuration lives under `../.claude`.

- `settings.json` registers safe project hooks and denies secret/build artifact reads.
- `hooks/session_context.py` injects compact startup context.
- `hooks/user_prompt_router.py` adds domain routing hints based on the user prompt.
- `hooks/pre_tool_guard.py` blocks dangerous shell patterns.
- `hooks/token_usage.py` records subagent token usage under `.claude/state/`.
- `agents/` contains focused project subagents.
- `skills/` contains user and model invocable project skills.
