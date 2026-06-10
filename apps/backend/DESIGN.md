# Backend API Design Rules

## Product principle

NestJS Fastify modular monolith.

## UI rules

- Mobile-first for student and parent.
- Desktop-first for admin.
- Use clear loading, empty, error, and forbidden states.
- Never expose `full_name`, age, parent data, or admin notes in public leaderboard.
- All user-facing text must go through localization.

## Linked docs

- [UX Spec](../../docs/10-UI_UX_SPEC.md)
- [Context](../../docs/08-CONTEXT.md)
