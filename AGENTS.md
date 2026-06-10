# Burro Agent Instructions

## Source of truth

- Start with `bd prime` for beads workflow rules.
- Track work in beads, not markdown task lists. Use `bd ready`, `bd show <id>`, `bd update <id> --claim`, and `bd close <id>`.
- Store durable project insights with `bd remember "insight"`. Do not create `MEMORY.md` files.
- If the local RAG helper exists at `/Users/admin/Documents/claude-node/scripts/rag-search.sh`, search it before broad local exploration for prior decisions.

## Context loading

- Read [docs/00-INDEX.md](docs/00-INDEX.md) and [docs/08-CONTEXT.md](docs/08-CONTEXT.md) first.
- Load only the smallest domain docs needed for the current task.
- Prefer `rg` and short `sed` ranges over full-file dumps.
- Use project Claude skills in [.claude/skills](.claude/skills) for repeatable workflows.
- Use project Claude subagents in [.claude/agents](.claude/agents) for high-output research, reviews, and isolated implementation.

## Project invariants

- Use pnpm only.
- Keep apps isolated.
- Shared contracts go in `packages/shared`.
- Shared UI and Tailwind tokens go in `packages/ui`.
- Never invent APIs, schemas, or Socket.IO events without updating docs.
- Student educational progress is durable. Premium controls access only; never delete progress because of premium, block, or soft delete state.
