# Burro Context

Burro Fonetika is an Arabic phonetics learning platform for children (ages 4–14), delivered Telegram-Mini-App-first. See [production PRD](docs/01-PRODUCTION_PRD.md), [architecture](docs/02-TECHNICAL_ARCHITECTURE.md), and [planning](docs/09-PLANNING.md).

Canonical source for student-app language and flow: [docs/12-FIGMA_FLOW_DESIGN.md](docs/12-FIGMA_FLOW_DESIGN.md) and [docs/13-STUDENT_FLOW_IMPLEMENTATION.md](docs/13-STUDENT_FLOW_IMPLEMENTATION.md). Where the older [images/DESIGN.md](images/DESIGN.md) disagrees, docs 12–13 win. See [ADR 0001](docs/adr/0001-canonical-student-naming.md).

## Language

**Student**:
A child learner who studies modules, answers exercises, earns XP, and appears on the leaderboard.
_Avoid_: Child, learner, user, kid

**Module**:
A unit of learning grouped by Arabic letters/sounds. A student progresses through an ordered path of modules.
_Avoid_: Lesson, course, topic

**Exercise**:
A single question inside a module (e.g. find_letter, find_sound, listen_find_letter, listen_find_sound). The unit a student answers.
_Avoid_: Question (informal only), quiz, task

**Attempt**:
One run through a module's exercises. Answers are submitted per-exercise and the attempt tracks progress and XP.
_Avoid_: Session, try, round

**Final Quiz**:
The gated end-of-module test (with hearts and a pass score) that completes a module. Distinct from ordinary in-module practice.
_Avoid_: Quiz (unqualified), exam, test

**Practice**:
Working through a module's exercises outside the gated Final Quiz. Together "practice" and "final quiz" are the two attempt modes.
_Avoid_: Training, drill

**XP**:
Points a student earns for correct answers and completed work. Drives level and leaderboard score. Granted idempotently — never twice for the same answer.

**Active Days**:
Count of distinct days a student has learned. Shown on dashboard, profile, and stats.
_Avoid_: Streak (a streak is consecutive; active days need not be)

**Daily Task**:
A small daily goal (e.g. "5 questions") shown on the dashboard with a reward XP.

**Hearts**:
Limited wrong-answer allowance during a Final Quiz; reaching zero fails the attempt. Not used in free practice.
_Avoid_: Lives

**Premium gate**:
An access check that locks premium-only modules. It gates access only — it never deletes or hides educational progress already earned.
_Avoid_: Paywall (when referring to progress), subscription lock

**Module status**:
A module is exactly one of: `completed`, `current`, `available`, `locked`, `premium_locked`.

**Sound Info**:
A short explanation screen for an Arabic sound, with audio playback, shown before/inside module practice.
_Avoid_: Lesson detail

**Leaderboard**:
A public ranking of students by score/XP, showing only Telegram-safe identity (first name, username, avatar) — never full name, age, phone, or parent data.
