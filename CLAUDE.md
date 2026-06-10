# Burro Claude Guide

You are working on Burro Fonetika, an Arabic phonetics learning platform for children aged 4-14.

## First move

- Run `bd prime` when starting or after compaction.
- Use beads for task tracking: `bd ready`, `bd show <id>`, `bd update <id> --claim`, `bd close <id>`.
- Use `bd remember "insight"` for durable project memory. Do not create `MEMORY.md` files.
- If `/Users/admin/Documents/claude-node/scripts/rag-search.sh` exists, search it before broad exploration that may depend on prior project decisions.

## Token discipline

- Treat this file as a compact router, not the whole project manual.
- Read [docs/00-INDEX.md](docs/00-INDEX.md) and [docs/08-CONTEXT.md](docs/08-CONTEXT.md), then only the domain docs needed for the task.
- Prefer `rg`, `rg --files`, and short line ranges.
- Use `.claude/skills/*` for repeatable workflows instead of pasting instructions.
- Use `.claude/agents/burro-context-scout.md` for noisy read-only discovery and return a compact summary.

## Core invariants

- Use pnpm only.
- Keep apps isolated.
- Shared contracts live in `packages/shared`; shared UI and tokens live in `packages/ui`.
- Do not invent APIs, schemas, Socket.IO events, or production behavior without updating docs.
- Student progress is durable. Premium gates access only; never delete educational progress because of premium, block, or soft delete state.
