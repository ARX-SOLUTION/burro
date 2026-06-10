# Admin Panel Design Rules

## Product principle

CMS, moderation, premium, analytics.

## UI rules

- Mobile-first for student and parent.
- Desktop-first for admin.
- Use clear loading, empty, error, and forbidden states.
- Never expose `full_name`, age, parent data, or admin notes in public leaderboard.
- All user-facing text must go through localization.

## Linked docs

- [UX Spec](../../docs/10-UI_UX_SPEC.md)
- [Context](../../docs/08-CONTEXT.md)


## Shared Design References

- [../../docs/12-FIGMA_FLOW_DESIGN.md](../../docs/12-FIGMA_FLOW_DESIGN.md)
- [../../docs/design/design-tokens.css](../../docs/design/design-tokens.css)

Do not copy Student App game UI blindly into this app. Reuse tokens and brand style, but keep app-specific UX:

- Parent App: monitoring and clarity.
- Admin Panel: dense data management and safety.
