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


<!-- BEGIN BEADS INTEGRATION v:1 profile:minimal hash:6cd5cc61 -->
## Beads Issue Tracker

This project uses **bd (beads)** for issue tracking. Run `bd prime` to see full workflow context and commands.

### Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --claim  # Claim work
bd close <id>         # Complete work
```

### Rules

- Use `bd` for ALL task tracking — do NOT use TodoWrite, TaskCreate, or markdown TODO lists
- Run `bd prime` for detailed command reference and session close protocol
- Use `bd remember` for persistent knowledge — do NOT use MEMORY.md files

**Architecture in one line:** issues live in a local Dolt DB; sync uses `refs/dolt/data` on your git remote; `.beads/issues.jsonl` is a passive export. See https://github.com/gastownhall/beads/blob/main/docs/SYNC_CONCEPTS.md for details and anti-patterns.

## Agent Context Profiles

The managed Beads block is task-tracking guidance, not permission to override repository, user, or orchestrator instructions.

- **Conservative (default)**: Use `bd` for task tracking. Do not run git commits, git pushes, or Dolt remote sync unless explicitly asked. At handoff, report changed files, validation, and suggested next commands.
- **Minimal**: Keep tool instruction files as pointers to `bd prime`; use the same conservative git policy unless active instructions say otherwise.
- **Team-maintainer**: Only when the repository explicitly opts in, agents may close beads, run quality gates, commit, and push as part of session close. A current "do not commit" or "do not push" instruction still wins.

## Session Completion

This protocol applies when ending a Beads implementation workflow. It is subordinate to explicit user, repository, and orchestrator instructions.

1. **File issues for remaining work** - Create beads for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **Handle git/sync by active profile**:
   ```bash
   # Conservative/minimal/default: report status and proposed commands; wait for approval.
   git status

   # Team-maintainer opt-in only, unless current instructions forbid it:
   git pull --rebase
   git push
   git status
   ```
5. **Hand off** - Summarize changes, validation, issue status, and any blocked sync/commit/push step

**Critical rules:**
- Explicit user or orchestrator instructions override this Beads block.
- Do not commit or push without clear authority from the active profile or the current user request.
- If a required sync or push is blocked, stop and report the exact command and error.
<!-- END BEADS INTEGRATION -->
