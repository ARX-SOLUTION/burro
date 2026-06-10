# FIGMA_TO_REACT_SKILL.md

## Goal

Convert Figma reference screens into reusable React + Tailwind components without duplicating layout logic.

## Process

1. Open [../12-FIGMA_FLOW_DESIGN.md](../12-FIGMA_FLOW_DESIGN.md).
2. Open the matching image in [../design/reference-screens/README.md](../design/reference-screens/README.md).
3. Identify reusable components before writing screen-specific code.
4. Use tokens from [../design/tailwind.tokens.ts](../design/tailwind.tokens.ts).
5. Implement loading, error, empty, and forbidden states.
6. Check safe-area and 402px mobile width.

## Required component extraction

- AppBackground
- GlassCard
- PrimaryGlowButton
- BottomNav
- QuizShell
- ChoiceButton
- AudioCircleButton
- ModuleCard
- LearningPathNode
- BottomSheet

## Acceptance

- No absolute docs links.
- No hard-coded API URLs.
- No hard-coded user-facing text outside i18n.
- No MVP pronunciation route unless feature flag is enabled.
