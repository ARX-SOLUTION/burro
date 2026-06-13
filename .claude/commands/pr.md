---
description: Create a GitHub PR for the current branch (base main) with Burro conventions
argument-hint: "[optional: extra context / bd issue id for the PR body]"
allowed-tools: Bash(git *), Bash(gh pr *)
---

# Create Pull Request

Open a PR from the current branch into `main` for the Burro monorepo (`ARX-SOLUTION/burro`).

## Repo state (auto-collected)

- Current branch: !`git rev-parse --abbrev-ref HEAD`
- Uncommitted changes: !`git status --short`
- Commits ahead of origin/main: !`git log origin/main..HEAD --oneline 2>/dev/null || echo "(branch not pushed or origin/main not fetched)"`
- Diff stat vs origin/main: !`git diff origin/main --stat 2>/dev/null || git diff --stat`
- Existing PR for this branch: !`gh pr view --json url,state --jq '.state + " " + .url' 2>/dev/null || echo "none"`

## Extra context from the user

$ARGUMENTS

## Rules

1. **Never** open a PR from `main`. If the current branch is `main`, stop and tell the user to create a feature branch first.
2. If "Existing PR" above is not `none`, do **not** create a duplicate — show the URL and offer to update it with `gh pr edit` instead.
3. If there are uncommitted changes the user wants in the PR, stage and commit them first using Conventional Commits style (`feat:`, `fix:`, `docs:`, `test:`, `chore:`, `refactor:`). End every commit message with:
   `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`
4. Push the branch to origin if it has no upstream: `git push -u origin <branch>`.
5. Force-push, `git reset --hard`, and `git clean -f` are blocked by the repo guard — do not attempt them.

## PR title

One line, Conventional Commits style, ≤ 72 chars, no trailing period. Summarize the commits above.

## PR body — use exactly this structure

```
## Summary
- <what changed and why, 2-4 bullets>

## Test plan
- <commands run / how to verify, e.g. `pnpm test`, manual steps>

## Issues
- bd: <burro-dev-... issue id(s), or "none">

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

Notes:
- This repo tracks issues in **beads (bd)**, not GitHub Issues — reference `bd` IDs in the **Issues** section. Do **not** use `Closes #N` (that targets GitHub Issues, which this repo does not use). See `docs/agents/issue-tracker.md`.
- If the user did not supply a bd id, find the relevant one with `bd ready` / `bd list`; if none applies, write `none`.

## Create it

Run:

```
gh pr create --base main --title "<title>" --body "<body>"
```

Then print the returned PR URL.
