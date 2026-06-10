# Student App Design Rules

## Source of truth

The Student App must follow the uploaded Figma flow.

Primary docs:

- [../../docs/12-FIGMA_FLOW_DESIGN.md](../../docs/12-FIGMA_FLOW_DESIGN.md)
- [../../docs/13-STUDENT_FLOW_IMPLEMENTATION.md](../../docs/13-STUDENT_FLOW_IMPLEMENTATION.md)
- [../../docs/design/reference-screens/README.md](../../docs/design/reference-screens/README.md)
- [../../docs/design/design-tokens.css](../../docs/design/design-tokens.css)
- [../../packages/ui/src/tailwind-preset.ts](../../packages/ui/src/tailwind-preset.ts)

## Product principle

Telegram Mini App first. Mobile web second. Desktop is not a target for the Student App.

## Visual rules

- Use dark blue background on all main screens.
- Use white glass cards for readable content.
- Use cyan glow buttons for primary actions.
- Use green for success and completed modules.
- Use red for wrong answers and destructive actions.
- Use yellow/orange for XP and premium highlights.
- Keep bottom navigation fixed and safe-area aware.

## Exercise flow rule

Figma flow is required:

```txt
select option
→ Tekshirish
→ feedback
→ Davom etish
```

Do not auto-submit immediately on option tap.

## Required shared components

```txt
AppBackground
GlassCard
PrimaryGlowButton
BottomNav
LanguagePill
ModuleCard
LearningPathNode
QuizShell
ChoiceButton
AudioCircleButton
FeedbackCard
BottomSheet
```

## Feature flags

Pronunciation screens exist in design but are post-MVP.

```ts
FEATURE_PRONUNCIATION=false
```

Do not expose pronunciation routes in MVP.

## Linked docs

- [UX Spec](../../docs/10-UI_UX_SPEC.md)
- [Context](../../docs/08-CONTEXT.md)
- [API Spec](../../docs/04-API_SPEC.md)
- [Permission Matrix](../../docs/05-PERMISSION_MATRIX.md)
