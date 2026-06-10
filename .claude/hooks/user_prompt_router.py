import re

from shared import add_context, read_input


input_data = read_input()
prompt = " ".join(
    str(value)
    for value in [
        input_data.get("prompt"),
        input_data.get("user_prompt"),
        input_data.get("message"),
        input_data.get("raw"),
    ]
    if value
).lower()

hints = []


def add_if(pattern, lines):
    if re.search(pattern, prompt):
        hints.extend(lines)


add_if(
    r"\b(api|backend|nestjs|fastify|endpoint|contract|dto|guard|service)\b",
    [
        "- API/backend work: read docs/04-API_SPEC.md, docs/03-DATABASE_SCHEMA.md, apps/backend, and packages/shared.",
        "- Invoke /burro-api-contract or /burro-backend-module when contracts, DTOs, or modules change.",
    ],
)

add_if(
    r"\b(db|database|drizzle|migration|schema|postgres|index|query)\b",
    [
        "- Database work: read docs/03-DATABASE_SCHEMA.md and docs/05-PERMISSION_MATRIX.md before schema changes.",
        "- Never hard-delete learning progress; prefer reversible migrations and explicit indexes.",
    ],
)

add_if(
    r"\b(figma|ui|ux|screen|student|react|tailwind|mobile|telegram mini app)\b",
    [
        "- Student/UI work: read docs/12-FIGMA_FLOW_DESIGN.md, docs/13-STUDENT_FLOW_IMPLEMENTATION.md, apps/students/DESIGN.md, and packages/ui/src/tailwind-preset.ts.",
        "- Invoke /burro-figma-to-react or /burro-frontend-screen for screen implementation.",
    ],
)

add_if(
    r"\b(test|qa|review|regression|coverage|vitest|e2e)\b",
    [
        "- QA work: invoke /burro-testing and keep noisy test output in a subagent when possible.",
        "- Return only failing test names, exact errors, and the focused command used.",
    ],
)

add_if(
    r"\b(deploy|pm2|production|backup|release|caddy|nginx)\b",
    [
        "- Deployment work: invoke /burro-deploy manually; it is user-invoked only because it can trigger risky actions.",
        "- Prefer build, backup, migrate, pm2 reload, then log verification.",
    ],
)

add_if(
    r"\b(context|planning|plan|agent|subagent|skill|hook|token|claude)\b",
    [
        "- Agent/context work: read docs/agents/OPERATING_MODEL.md and docs/skills/README.md.",
        "- Keep CLAUDE.md short; move procedures into project skills so they load only when invoked.",
    ],
)

if hints:
    unique_hints = list(dict.fromkeys(hints))[:8]
    add_context("UserPromptSubmit", "Burro routing hints:\n" + "\n".join(unique_hints))
