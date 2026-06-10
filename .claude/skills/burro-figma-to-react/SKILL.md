---
name: burro-figma-to-react
description: Use when converting Burro Figma/reference screens into React and Tailwind components, extracting reusable UI, or checking screenshot parity.
---

# Burro Figma To React

Read first:
- `docs/12-FIGMA_FLOW_DESIGN.md`
- `docs/13-STUDENT_FLOW_IMPLEMENTATION.md`
- `docs/design/reference-screens/README.md`
- `apps/students/DESIGN.md`
- `packages/ui/src/tailwind-preset.ts`

Implementation rules:
1. Extract reusable components before screen-specific code.
2. Use shared tokens and avoid hard-coded API URLs.
3. Implement loading, error, empty, and forbidden states.
4. Check safe area and 402px mobile layout.
5. Keep pronunciation routes behind feature flags for MVP.

Expected component candidates:
AppBackground, GlassCard, PrimaryGlowButton, BottomNav, QuizShell, ChoiceButton, AudioCircleButton, ModuleCard, LearningPathNode, BottomSheet.
