---
name: burro-deploy
description: User-invoked deployment workflow for Burro build, backup, migration, PM2 reload, and production verification.
disable-model-invocation: true
---

# Burro Deploy

Use only when the user explicitly invokes this skill.

Release procedure:
1. Inspect `git status` and current branch.
2. Run focused tests, typecheck, and build.
3. Confirm backup and rollback path.
4. Apply migrations only after approval.
5. Prefer `pm2 reload` over restart.
6. Verify health endpoints and logs.
7. Report exact commands, results, and rollback notes.

Do not deploy, migrate, reload PM2, or push without explicit approval.
