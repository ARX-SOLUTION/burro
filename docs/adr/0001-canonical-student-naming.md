# Canonical student-app naming and source of truth

We make `docs/12-FIGMA_FLOW_DESIGN.md` and `docs/13-STUDENT_FLOW_IMPLEMENTATION.md` the canonical source for student-app domain language, routes, and shared-component names, overriding the older `images/DESIGN.md` and the early mock-driven code. Existing code is renamed to match the spec rather than the docs being rewritten to match the code, because the docs encode deliberate flow semantics (e.g. `/learn/...` routes and the select → Tekshirish → feedback → Davom etish flow) and the current screens are throwaway mock sketches that are being rebuilt for pixel parity anyway.

## Consequences

- Routes adopt spec form: `/welcome`, `/login`, `/`, `/modules` (`?view=grid|path`), `/learn/:moduleId/attempt/:attemptId/question/:questionNo`, `/learn/:moduleId/sounds/:soundId/info`, `/modules/:moduleId/completed`, `/stats`, `/leaderboard`, `/profile`. The current `/modules/:id/practice|quiz` routes are replaced.
- Shared components are renamed to spec: `PrimaryGlowButton` (was `GradientButton`), `ChoiceButton` (was `AnswerOption`), `AudioCircleButton` (was `AudioButton`), `FeedbackCard` (was `FeedbackPanel`), plus new `QuizShell`, `AppBackground`, `BottomSheet`, `LearningPathNode`.
- Domain terms are fixed in [CONTEXT.md](../../CONTEXT.md): Module (not Lesson), Exercise, Attempt, Final Quiz, Student (not child/learner).
