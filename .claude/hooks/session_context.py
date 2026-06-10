from shared import add_context


add_context(
    "SessionStart",
    """Burro compact session context:
- Use beads for task state. Start with bd prime, then bd ready/show/update --claim/close as needed.
- Read docs/00-INDEX.md and docs/08-CONTEXT.md first, then load the smallest relevant docs.
- Product invariant: student progress is durable; premium gates access only.
- Monorepo map: apps/students, apps/parents, apps/adminpanel, apps/backend, packages/shared, packages/ui.
- Token rule: prefer rg, focused line ranges, project skills, and subagents for noisy exploration.""",
)
