---
name: burro-frontend-screen
description: Use when building or reviewing Burro React screens, routes, TanStack Query flows, Telegram Mini App layouts, loading/empty/error states, or shared UI usage.
---

# Burro Frontend Screen

Read first:
- target app `DESIGN.md`
- `docs/10-UI_UX_SPEC.md`
- `docs/12-FIGMA_FLOW_DESIGN.md` and `docs/13-STUDENT_FLOW_IMPLEMENTATION.md` for student app work
- `packages/ui/src/tailwind-preset.ts`

Rules:
1. Use existing routes, API helpers, and shared tokens.
2. Implement loading, empty, error, and forbidden states.
3. Keep mobile-first layouts stable at 402px width.
4. Protect Telegram safe area.
5. Keep user-facing text in the localization layer when one exists.
6. Run the target app typecheck/build when practical.
