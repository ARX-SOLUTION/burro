# Planning

Planning is beads-backed. Do not use markdown task lists as the source of truth for work state.

## Execution model

1. Run `bd prime`.
2. Inspect `bd ready`.
3. Use `bd show <id>` and `bd update <id> --claim` before implementation.
4. If the user asks for new work that has no matching issue, create a beads issue with acceptance criteria.
5. Load the smallest context pack from [08-CONTEXT.md](08-CONTEXT.md).
6. Execute a narrow vertical change.
7. Validate with the smallest meaningful command.
8. Close the beads issue only after verification.

## Planning record

For large changes, record:
- objective
- scope included
- scope excluded
- dependencies and blockers
- affected apps/packages
- docs that must stay in sync
- validation command
- rollback or recovery path
- beads issue id

## Delivery gates

- Contract gate: API, DB, shared types, Socket.IO events, and UI expectations agree.
- Permission gate: roles, parent/student/admin boundaries, and private data exposure are checked.
- Progress gate: student learning progress is never deleted by premium, block, or soft delete flows.
- UX gate: loading, empty, error, forbidden, selected, correct, and wrong states exist where relevant.
- Release gate: build/test result, backup, migration path, PM2 reload plan, and log verification are known.

## Phase 0 — Repository setup

- pnpm workspace
- root package.json
- Makefile
- PM2 ecosystem
- app folders
- shared packages

## Phase 1 — Backend foundation

- NestJS + Fastify
- Config module
- Drizzle setup
- PostgreSQL migrations
- Redis connection
- BullMQ connection
- Health endpoint

## Phase 2 — Auth

- Telegram Mini App initData validation
- Web OTP via Telegram bot
- Sessions/JWT
- Role guards

## Phase 3 — Users

- Student profile
- Parent profile
- Admin profile
- Status logic

## Phase 4 — Learning CMS

- Modules
- Module translations
- Media library
- Exercise library
- Module exercise attachment
- Publish validation

## Phase 5 — Student learning engine

- Learning path
- Module explanation
- Practice attempts
- Final quiz attempts
- Hearts
- Completion logic

## Phase 6 — XP and achievements

- XP ledger
- Anti-duplicate rewards
- Active Days
- Fixed achievements

## Phase 7 — Premium

- Premium requests
- Admin approval/reject
- Premium grants
- Expiration/revoke
- Current module grace

## Phase 8 — Parent

- Invite flow
- Accept link
- Parent dashboard
- Child leaderboard highlight

## Phase 9 — Leaderboards and realtime

- Global leaderboard
- Module leaderboard
- Socket.IO rooms
- Realtime events

## Phase 10 — Notifications

- Templates
- In-app notifications
- Telegram queue
- Delivery attempts

## Phase 11 — Moderation

- Block/unblock
- Delete requests
- Soft delete
- Restore

## Phase 12 — Admin analytics

- Dashboard KPIs
- Audit logs
- Reports

## Phase 13 — Production

- Caddy/Nginx
- PM2
- backups
- monitoring
- launch checklist
