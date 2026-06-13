# Issue tracker: Beads (bd)

Issues and PRDs for this repo live in the local beads database (`.beads/`), managed with the `bd` CLI. Do not use GitHub Issues, TodoWrite, or markdown TODO lists for task tracking.

## Conventions

- Create issues with `bd create "title" -d "description"` (add `--acceptance` for acceptance criteria).
- A PRD is an epic: `bd create "PRD: <feature>" --body-file <prd.md>`, then link implementation issues to it with `--deps` or `bd link`.
- Triage state is a label (see `triage-labels.md`): `bd label add <id> <label>`, `bd label remove <id> <label>`.
- Comments and conversation history: `bd comment <id> "text"`, read with `bd comments <id>`.

## When a skill says "publish to the issue tracker"

Run `bd create`. For multi-issue breakdowns (`/to-issues`), create the epic first, then child issues with dependency links so `bd ready` reflects the correct order.

## When a skill says "fetch the relevant ticket"

`bd show <id>`. To find work: `bd ready`, `bd list --label <triage-label>`, or `bd search "<query>"`.

## When a skill says "close the issue"

`bd close <id>`. Reopen with `bd reopen <id>` if needed.
