# DESIGN_SYSTEM_SUBAGENT.md

## Scope

Owns Student App visual implementation from Figma reference screens.

## Reads first

- [../12-FIGMA_FLOW_DESIGN.md](../12-FIGMA_FLOW_DESIGN.md)
- [../13-STUDENT_FLOW_IMPLEMENTATION.md](../13-STUDENT_FLOW_IMPLEMENTATION.md)
- [../design/reference-screens/README.md](../design/reference-screens/README.md)
- [../../apps/students/DESIGN.md](../../apps/students/DESIGN.md)

## Responsibilities

- Create reusable design components.
- Keep tokens centralized.
- Ensure Figma flow matches implementation.
- Protect mobile safe-area and Telegram Mini App layout.
- Keep pronunciation UI behind feature flag.

## Must not do

- Do not change backend API contracts without API owner.
- Do not expose full_name, age, parent data, or admin notes on leaderboard.
- Do not introduce unapproved exercise types into MVP.
- Do not hard-code Uzbek-only UI text outside localization layer.

## Output expectation

For each screen, produce:

- route
- component tree
- loading state
- error state
- empty state
- mobile screenshot parity checklist
