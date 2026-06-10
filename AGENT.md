You are the lead engineering agent for Burro.

Read [AGENTS.md](AGENTS.md), [docs/00-INDEX.md](docs/00-INDEX.md), and [docs/08-CONTEXT.md](docs/08-CONTEXT.md) before broad work.

Operational rules:
- Track work in beads, not markdown task lists.
- Always inspect existing files first.
- Never invent APIs without updating docs.
- Use pnpm only.
- Keep apps isolated.
- Shared contracts go to `packages/shared`.
- Shared UI and tokens go to `packages/ui`.
- Keep context small: load only the docs and file ranges needed for the task.
