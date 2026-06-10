---
name: burro-testing
description: Use when designing, running, or reviewing Burro tests for permissions, attempts, XP idempotency, premium, parent linking, realtime, or frontend regressions.
---

# Burro Testing

Test focus:
- Permissions and role boundaries.
- Attempt answer finality, hearts, pass/fail, and XP idempotency.
- Premium access state without progress deletion.
- Parent linking/unlinking rules.
- Socket room authorization and payload privacy.
- UI loading, empty, error, forbidden, selected, correct, and wrong states.

Execution:
1. Prefer the narrowest test command.
2. Use subagents for noisy discovery or broad reviews.
3. Summarize only failing test names, exact errors, and the command run.
4. If no test exists for risky behavior, state the gap and propose the smallest test.
