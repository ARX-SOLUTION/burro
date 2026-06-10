# Agent System

Agents must follow [OPERATING_MODEL.md](OPERATING_MODEL.md). Keep this directory as the durable prompt registry; use Claude Code project subagents in [../../.claude/agents](../../.claude/agents) for executable routing.

Main agents:

- [MASTER_AGENT.md](MASTER_AGENT.md)
- [BACKEND_AGENT.md](BACKEND_AGENT.md)
- [STUDENT_APP_AGENT.md](STUDENT_APP_AGENT.md)
- [PARENT_APP_AGENT.md](PARENT_APP_AGENT.md)
- [ADMIN_AGENT.md](ADMIN_AGENT.md)
- [DATABASE_AGENT.md](DATABASE_AGENT.md)
- [TELEGRAM_AGENT.md](TELEGRAM_AGENT.md)
- [DEVOPS_AGENT.md](DEVOPS_AGENT.md)
- [QA_AGENT.md](QA_AGENT.md)
- [SECURITY_AGENT.md](SECURITY_AGENT.md)

Context rule:

- Read [../00-INDEX.md](../00-INDEX.md), [../08-CONTEXT.md](../08-CONTEXT.md), and [OPERATING_MODEL.md](OPERATING_MODEL.md).
- Then read only the domain pack needed for the current task.
- Use beads for task state and never use markdown task lists for tracking.

Claude Code subagents:

- `burro-context-scout`: read-only discovery with compact summaries.
- `burro-backend-implementer`: focused backend/API/module execution.
- `burro-frontend-implementer`: focused React/Tailwind/Telegram UI execution.
- `burro-reviewer`: read-only quality, security, and regression review.
- `burro-release-operator`: release planning and approval-gated operations.
