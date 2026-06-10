# STUDENT_FLOW_SUBAGENT.md

## Scope

Owns the Student App route and interaction flow.

## Reads first

- [../13-STUDENT_FLOW_IMPLEMENTATION.md](../13-STUDENT_FLOW_IMPLEMENTATION.md)
- [../12-FIGMA_FLOW_DESIGN.md](../12-FIGMA_FLOW_DESIGN.md)
- [../04-API_SPEC.md](../04-API_SPEC.md)

## Responsibilities

- Implement welcome → login → dashboard → learning → completion flow.
- Implement modules grid/path toggle.
- Implement exercise state machine.
- Implement leaderboard current-rank pin behavior.
- Implement profile language bottom sheet.

## Exercise submit rule

```txt
select option
→ Tekshirish
→ backend submit
→ feedback
→ Davom etish
```

Never grant XP in the frontend.
