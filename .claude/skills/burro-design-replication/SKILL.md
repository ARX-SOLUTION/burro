---
name: burro-design-replication
description: Strict 1:1 design replication directive for Burro student screens. Use when polishing or rebuilding a screen against its Figma reference PNG.
---

# DESIGN REPLICATION DIRECTIVE — Burro

## Sources of truth (cite at top of every plan)

1. **Curated reference PNGs** — `docs/design/reference-screens/<NN>-<slug>.png` (402×874 @1x). Visual ground truth.
2. **Raw Figma export** — `images/students/` (28 raw screens) and `images/parent/Burro bot.fig` (the .fig is a ZIP; raster fills under `images/<sha1>` blobs).
3. **Design tokens** — `packages/ui/src/tokens.css`, `packages/ui/src/tailwind-preset.ts`, `docs/design/design-tokens.css`.
4. **Flow + DTO spec** — `docs/12-FIGMA_FLOW_DESIGN.md`, `docs/13-STUDENT_FLOW_IMPLEMENTATION.md`.
5. **Brand assets** — `apps/students/public/assets/`.

On any conflict between this directive and the source, **the source wins**. The plan is only the translation map into React + Tailwind + tokens.css.

## Replicate 1:1 — UI

Reproduce every value exactly: colors, fonts, weights, radii, shadows, spacing, sizes, borders, opacity, gradients, SVG paths, animations.

Match all visual states: default, selected, today, disabled, empty, loading, error, focus, correct, wrong, locked, premium_locked.

Translate units into the project's idiom without changing the value:
- CSS px → px (no rem/em conversion unless the token system uses it)
- Hex → existing `--burro-*` token from `packages/ui/src/tokens.css`; if missing, ADD it with the exact value — never approximate.
- Shadow → `box-shadow` token; if missing, ADD.
- Spacing → existing scale in `tailwind-preset.ts`; if missing, ADD.

The structure of stateful elements must match the source. If a highlight wraps the whole cell in the source, wrap the whole cell in code — don't move it onto a child.

## Replicate 1:1 — UX

Reproduce interactions, selection model, gestures, transitions exactly as the source expresses.

Exercise flow specifically: `select option → Tekshirish → feedback (correct|wrong) → Davom etish → next`. Never auto-submit. Audio: only one clip plays at a time. Hearts: decrement only on wrong in `final_quiz`, never in `practice`.

## Logic — the ONLY thing we change

Replace the source's hardcoded sample values with the project's real data, state, formatting, navigation, permissions, and copy:
- Data from `packages/shared/src/contracts/*` DTOs + the real backend endpoints in `apps/backend/src/modules/*`.
- Reuse existing TanStack Query hooks in `apps/students/src/features/*`. Add fields only if the design needs data the model lacks; flag it explicitly.
- Routes from `apps/students/src/router.tsx` (no new routes without orchestrator approval).
- Auth: dev `x-student-id` header today; real Telegram + OTP later (see [ADR 0001](../../docs/adr/0001-canonical-student-naming.md) for canonical names).

## Rules

- No tweaks, no "cleaner" versions, no creative liberties.
- If a 1:1 match is impossible — or conflicts with a locked decision in `docs/adr/` or `CONTEXT.md` — **STOP and ask** before deviating.
- Before coding: output a **token translation table** (source value → token / unit / color). Use the format below.
- After coding: verify element-by-element against the **source PNG (or .fig blob)** — not against your memory of it. List anything that differs and why.
- Any deviation must be flagged as an explicit "stop-and-ask" item with: source value, proposed substitution, reason.

## Token translation table format

```
| Source (px / hex / weight) | Element | Token / class | Note |
|---|---|---|---|
| #5BC8FF→#1E78E0 vertical | Welcome logo fill | linear-gradient with --burro-cyan-400 → --burro-blue-600 | exact stops from Figma fill |
| 96 px square, rx 22 | Welcome logo | <svg width="96" height="96"> rect rx="22" | already in WelcomeScreen.tsx |
| 32 px / 800 | Wordmark "Burro" | font-size 32; font-weight 800; --burro-text-on-dark | uses .welcome-wordmark |
```

## Verification checklist (per screen)

- [ ] Layout: width 402 px, height 874 px viewport
- [ ] Safe-area top + bottom respected
- [ ] All component states match source (selected/correct/wrong/disabled/loading/empty/error/focus)
- [ ] Real data from backend renders without console errors
- [ ] No PII leaks on shared screens (leaderboard rule: first name + username + avatar + score only)
- [ ] No diagonal stripes, fake gradients, or stylistic flourishes not present in source
- [ ] Bottom-nav visibility matches `apps/students/DESIGN.md` §11
- [ ] Mobile viewport meta still present in `apps/students/index.html`

## When the source disagrees with the implementation

Source PNG always wins. If a token system value contradicts the PNG, update the token (with a [bd remember](https://github.com/gastownhall/beads) note). If a backend DTO field is missing for the visual the PNG shows, file a bead under the active polish epic and stub the field with a clear `// TODO(bd-NNN)` comment — do not silently invent data.

## Cleanup mandate

When replacing a sketch with the 1:1 version:
- Delete the dead CSS classes the previous draft introduced.
- Delete unused mock data files (`features/<x>/mock.ts`) once the real-data path is live.
- Do not leave half-finished alternative layouts behind.
