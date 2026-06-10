# UI/UX Spec

## Student app

Primary UI: mobile-first Telegram Mini App.

### Home

- XP
- active days
- current module
- premium status
- achievement preview
- notification count

### Learning Path

Duolingo-style vertical path. Current module is centered when possible.

States:

- completed: green/check
- current: highlighted
- available: clickable
- locked: dimmed
- premium_locked: gold lock

### Module Screen

Flow:

```txt
Explanation → Start Module → Exercises → Final Quiz → Result
```

### Exercise Screen

- four large option buttons
- selecting option auto-submits
- feedback shows correct/incorrect and correct answer
- Next button required

### Final Quiz

- hearts visible
- score visible only on result screen
- fail requires full practice repeat

## Parent app

Read-only. Child selector on top if multiple children. Leaderboard highlights selected child and dims others. If selected child is outside loaded range, show pinned rank card.

## Admin panel

Desktop-first. Dense but readable tables. All destructive actions require confirmation. Moderation internal notes never shown to student/parent.


## Figma Flow Addendum

The Student App visual implementation must follow:

- [12-FIGMA_FLOW_DESIGN.md](12-FIGMA_FLOW_DESIGN.md)
- [13-STUDENT_FLOW_IMPLEMENTATION.md](13-STUDENT_FLOW_IMPLEMENTATION.md)
- [design/reference-screens/README.md](design/reference-screens/README.md)

Exercise UI uses the Figma flow: select option, tap **Tekshirish**, then show feedback and **Davom etish**.
