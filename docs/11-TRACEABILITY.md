# Traceability Map

> **Status:** 2026-06-14. Tracked alongside the MVP delivery epic `burro-dev-c86`. Update this doc as epics close.
>
> **Legend:** ✅ implemented · 🟡 partial · ❌ missing · ➖ out of MVP scope.
>
> Gaps cross-link to open beads via the `bd show <id>` IDs in the rightmost column.

## PRD Requirement Status

| §  | PRD requirement | Status | Code / data | Open gaps (bd) |
|----|---|---|---|---|
| 3  | 4 production domains (burroarab.uz, parent., admin., api.) | ❌ | — | c86.13.1 |
| 4  | Roles: student / parent / admin (MVP) | 🟡 | `apps/backend/src/modules/auth` (dev mode); role enum in `packages/shared` | c86.1.4 RBAC route guards |
| 7  | Non-goals (payments, scoring, RLS, tenancy) | ➖ | — | — |
| 8  | Telegram Mini App auth (`initData` validate) | ❌ | dev header only (`x-student-id`) | c86.1.5 |
| 8  | Web OTP login (TTL 2 min, max 5 attempts) | ❌ | — | c86.1.1 (bot), c86.1.2 (web OTP) |
| 9  | Student onboarding (language, name, age 4–14) | 🟡 | `LoginScreen.tsx` placeholder; no age/lang collection yet | c86.12.1 |
| 10 | Localization uz/ru/en (DB-backed translations) | 🟡 | `module_translations`, `exercise_translations`, `sound_translations`; backend resolves per user; UI i18n infra missing | c86.12.4 |
| 11 | Learning model: module / exercises / final quiz | ✅ | `apps/backend/src/modules/learning`, `…/attempts` | — |
| 12 | Vertical learning path (5 states) | 🟡 | `apps/students/src/screens/ModulePathScreen.tsx`; backend `GET /student/path` | c86.2.1 (full vertical), c86.2.2 (module detail), c86.2.3 (final quiz vertical) |
| 13 | Content pacing controlled by admin | 🟡 | `modules.*` columns implemented | c86.4.1 (admin modules CRUD) |
| 14 | 4 exercise types (`find_letter`, `find_sound`, `listen_*`) | 🟡 | `exercises.type` enum present; admin CRUD missing | c86.4.2 |
| 15 | 4 options, system shuffles on each attempt | ✅ | `AttemptEngine` (`apps/backend/src/modules/attempts/attempt-engine.ts`) | — |
| 16 | Reusable Exercise Library with draft/published/archived | 🟡 | `exercises.status` present; admin lifecycle UI missing | c86.4.2 |
| 17 | Media Library (audio/image, ≤10 MB, local serving) | ❌ | `media` table only; upload + serving missing | c86.4.3 |
| 18 | Final quiz with admin-overridable defaults | ✅ | `modules.{passScore,heartsCount,finalQuizPassXp}`; engine in attempts | c86.2.4 (completion side-effects) |
| 19 | Hearts apply only in final quiz | ✅ | `AttemptEngine` (covered by `attempt-engine.spec.ts`) | — |
| 20 | XP ledger (no direct mutation, no duplicate XP) | ✅ | `xp_transactions`, `student_xp_totals`; idempotency tested | c86.14.3 (closed) |
| 20.1 | Levels (formula in `@burro/shared`) | ✅ | `packages/shared/src/contracts/levels.ts` | — |
| 21 | Active Days (≥5 answers/day) | ✅ | `student_active_days` + AttemptEngine | c86.3.1 (closed) |
| 22 | Achievements (fixed system set + reward) | ❌ | — | c86.3.3 |
| 23 | Leaderboards (global+module, daily/weekly/all-time, cursor, pinned self) | 🟡 | `apps/backend/src/modules/leaderboard` (service+ranking spec'd); student screen unmocked | c86.7.1 (compute+API), c86.7.2 (students screen) |
| 24 | Parent read-only access (max 2 parents/student) | ❌ | — | c86.6.1, c86.6.2 |
| 25 | Parent linking (invite → accept → link) | ❌ | — | c86.6.1 |
| 26 | Premium gates access; durations; no payment in MVP | 🟡 | `apps/backend/src/modules/premium` (service+tests); access gate not enforced on path | c86.5.1 (schema+gate), c86.5.3 (admin ops) |
| 27 | Premium request flow (1 active, queue) | 🟡 | `premium_requests` table seeded; endpoints missing | c86.5.2 |
| 28 | Premium revoke preserves progress / XP | ✅ (invariant; needs regression test) | inferred from durability invariant | c86.14.2 |
| 29 | Moderation: block/unblock (preserves progress) | ❌ | `users.status` column only | c86.10.2 |
| 30 | Delete requests (5-state machine, soft delete) | ❌ | — | c86.10.3 |
| 31 | Notifications (in-app / Telegram / WebSocket; BullMQ queue) | ❌ | — | c86.9.1 (core), c86.9.2 (Telegram worker), c86.9.3 (students screen) |
| 32 | Realtime via Socket.IO (leaderboards, notifs, admin queues) | ❌ | — | c86.8.1 (gateway), c86.8.2 (event emit), c86.8.3 (frontend clients) |
| 33 | Admin Panel (Dashboard, Users, Learning, Gamification, Moderation, Comms, Settings) | ❌ | `apps/adminpanel/src` is a Vite stub | c86.11.1–c86.11.6 |
| 34 | Audit logs (immutable, on critical actions) | ❌ | — | c86.10.1 |
| 35 | PM2 deployment (4 processes, health, backups) | ❌ | `ecosystem.config.cjs` present; secrets + proxy + safe-deploy missing | c86.13.1, c86.13.2, c86.13.3, c86.13.4 |

### Testing & QA coverage

| Concern | Status | Reference | Open gaps (bd) |
|---|---|---|---|
| XP idempotency regression | ✅ | `apps/backend/src/modules/attempts/attempt-engine.spec.ts` | c86.14.3 (closed) |
| AttemptEngine `studentId` pass-through | ✅ | same file | — |
| `DrizzleExerciseCatalog.coerceLanguage` (uz/ru/en fallback) | ✅ | `…/adapters/drizzle-exercise.catalog.spec.ts` | — |
| Permission matrix (05) role × endpoint | ❌ | — | c86.14.1 |
| Progress durability invariants (premium revoke / block / soft delete) | ❌ | — | c86.14.2 |
| Realtime event contract tests (06 events) | ❌ | — | c86.14.4 |
| E2E golden path (login → path → practice → quiz → XP → leaderboard) | ❌ | `apps/students/e2e/student-ui.spec.ts` covers UI only | c86.14.5 |
| UX states pass (load / empty / error / forbidden across 3 apps) | ❌ | — | c86.14.6 |
| Seed idempotency under TRUNCATE | ❌ | — | urv.15 |
| Students unit-test harness (Vitest+RTL) | ❌ | only Playwright e2e exists | urv.16 |

## Module ↔ Data ↔ API summary

| Domain | Backend module | Tables (Drizzle) | HTTP / WS surface |
|---|---|---|---|
| Auth | `auth/` | `users`, (`web_login_codes`, `bot_chat_bindings` planned) | `/auth/*` |
| Learning | `learning/` | `modules`, `module_translations`, `module_feedback`, `module_exercises` | `/student/path`, `/student/modules/:id` |
| Attempts | `attempts/` | `exercises`, `exercise_options`, `exercise_translations`, `attempts`, `attempt_exercises`, `xp_transactions`, `student_xp_totals`, `student_active_days`, `student_module_progress` | `/student/attempts*`, `/student/modules/:id/practice`, `…/final-quiz/start` |
| Profile | `profile/` | `users` (subset) | `/student/profile` |
| Stats | `stats/` | derived from `xp_transactions`, `student_active_days` | `/student/stats` |
| Dashboard | `student-dashboard/` | aggregates | `/student/dashboard` |
| Leaderboard | `leaderboard/` | `leaderboard_entries` (compute pending) | `/leaderboards/*` |
| Premium | `premium/` | `premium_grants`, `premium_requests` | `/premium/*` (request flow pending) |
| Notifications | _missing_ | `notifications` (planned) | `/notifications` (planned) |
| Moderation | _missing_ | `delete_requests`, `audit_logs` (planned) | `/admin/*` (planned) |
| Audit | _missing_ | `audit_logs` (planned) | `/admin/audit-logs` (planned) |

## Figma Flow Traceability

| Figma Screen | Documentation | Implementation |
|---|---|---|
| Welcome | [12-FIGMA_FLOW_DESIGN.md](12-FIGMA_FLOW_DESIGN.md#91-welcome-screen) | `apps/students/src/screens/WelcomeScreen.tsx` |
| Login | [12-FIGMA_FLOW_DESIGN.md](12-FIGMA_FLOW_DESIGN.md#92-login-screen) | `apps/students/src/screens/LoginScreen.tsx` |
| Home | [12-FIGMA_FLOW_DESIGN.md](12-FIGMA_FLOW_DESIGN.md#93-home-dashboard) | `apps/students/src/screens/DashboardScreen.tsx` |
| Modules Grid | [12-FIGMA_FLOW_DESIGN.md](12-FIGMA_FLOW_DESIGN.md#94-modules-grid) | `apps/students/src/screens/ModulesScreen.tsx` |
| Modules Path | [12-FIGMA_FLOW_DESIGN.md](12-FIGMA_FLOW_DESIGN.md#95-modules-path) | `apps/students/src/screens/ModulePathScreen.tsx` |
| Exercise | [12-FIGMA_FLOW_DESIGN.md](12-FIGMA_FLOW_DESIGN.md#96-exercise-letter-to-sound) | `apps/students/src/features/attempts/ExercisePlayer.tsx` |
| Listen Exercise | [12-FIGMA_FLOW_DESIGN.md](12-FIGMA_FLOW_DESIGN.md#97-exercise-listen-and-choose) | same |
| Sound Info | [12-FIGMA_FLOW_DESIGN.md](12-FIGMA_FLOW_DESIGN.md#99-sound-info-screen) | `apps/students/src/screens/SoundInfoScreen.tsx` |
| Module Completed | [12-FIGMA_FLOW_DESIGN.md](12-FIGMA_FLOW_DESIGN.md#911-module-completion) | `apps/students/src/screens/ModuleCompletedScreen.tsx` |
| Statistics | [12-FIGMA_FLOW_DESIGN.md](12-FIGMA_FLOW_DESIGN.md#912-statistics-screen) | `apps/students/src/screens/StatsScreen.tsx` |
| Profile / Language sheet | [12-FIGMA_FLOW_DESIGN.md](12-FIGMA_FLOW_DESIGN.md#913-profile--language-bottom-sheet) | `apps/students/src/screens/ProfileScreen.tsx` |
| Leaderboard | [12-FIGMA_FLOW_DESIGN.md](12-FIGMA_FLOW_DESIGN.md#914-leaderboard) | `apps/students/src/screens/LeaderboardScreen.tsx` |
| Bottom navigation | n/a (component) | `apps/students/src/components/BottomNavbar.tsx` |

Exercise UI amendment: Figma flow requires selected state and explicit **Tekshirish** before submit. Currently implemented in `ExercisePlayer.tsx`.
