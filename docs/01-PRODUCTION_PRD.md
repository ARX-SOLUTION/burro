# Burro Fonetika — Production PRD v1.0

## 1. Product Summary

Burro Fonetika is a Telegram-first Arabic phonetics learning platform for children aged 4–14. It teaches Arabic letters and sounds through short modules, audio-based exercises, final quizzes, XP, achievements, active days, leaderboards, parent monitoring and admin-controlled premium access.

## 2. Product Name

Official product name: **Burro Fonetika**.

## 3. Platforms

- Student App: `https://burroarab.uz`
- Telegram Mini App: `https://burroarab.uz`
- Parent App: `https://parent.burroarab.uz`
- Admin Panel: `https://admin.burroarab.uz`
- Backend API: `https://api.burroarab.uz`

## 4. Roles

- Student
- Parent
- Admin

MVP has no teacher, organization, center tenant, or superadmin role. Multi-role Telegram users are allowed. Each app enforces its own required role.

## 5. Target Audience

Primary target: children aged 4–14. All students follow the same module-progress path. Age is used only for reporting and UI tone.

## 6. Scope

MVP content starts with 10 modules. Full product supports 60 modules. Modules 1–3 are free. Modules 4–60 require premium access.

## 7. Non-Goals

- Payments in MVP
- Pronunciation scoring in MVP
- Speech recording in MVP
- Organization/center tenancy in MVP
- PostgreSQL RLS in MVP
- Admin-created achievements in MVP
- Video lessons in MVP

## 8. Authentication

Telegram-first authentication.

### Telegram Mini App

Student opens the Mini App and frontend sends raw Telegram `initData` to backend. Backend validates `initData` before creating/resolving account.

### Web Login

Web login uses Telegram Bot OTP.

- URL pattern: `/login?redirect=<safe-internal-path>`
- OTP TTL: 2 minutes
- One-time use
- Max attempts: 5
- External redirects blocked

Admin and Parent apps also use Telegram Bot OTP login.

## 9. Student Onboarding

On first login:

- Telegram user ID is saved
- Telegram first name, last name, username, avatar are saved if available
- Student selects UI language
- Student confirms/edits full name
- Student confirms/edits display name
- Student selects exact age from 4 to 14

## 10. Localization

UI supports:

- Uzbek
- Russian
- English

Learning explanations are Uzbek-only in MVP. Translations use translation tables, not JSON blobs.

Fallback rule:

1. selected language
2. Uzbek
3. system error

## 11. Learning Model

Full course supports 60 modules using spaced repetition. Each new module introduces new material and may review previous modules.

Module structure:

```txt
Module
├─ Explanation
├─ Exercises
└─ Final Quiz
```

One module equals one lesson-level learning unit. There are no sections or nested lessons in MVP.

## 12. Learning Path

Student navigation uses a Duolingo-style vertical learning path. Each module is a node with progress ring and state.

States:

- completed
- current
- available
- locked
- premium_locked

When student taps a module:

```txt
Path Node
→ Explanation
→ Start Module
→ Exercises
→ Final Quiz
→ Completion Screen
```

## 13. Content Pacing

The system does not enforce fixed letters/sounds per module. Admin controls module content. Modules can be small, large, review-focused, or assessment-focused.

## 14. Exercise Types

MVP supports exactly four system-defined types:

- `find_letter`
- `find_sound`
- `listen_find_letter`
- `listen_find_sound`

Admins cannot create custom exercise types.

## 15. Exercise Options

Admin creates four options and marks one as correct. System shuffles options on every attempt. Wrong options are admin-managed.

## 16. Exercise Library

Exercises live in a global reusable Exercise Library. The same exercise can be attached to multiple modules and quizzes.

Exercise lifecycle:

- draft
- published
- archived

Referenced exercises cannot be hard-deleted.

## 17. Media Library

Global Media Library supports MVP types:

- audio
- image

Post-MVP types:

- svg
- lottie
- video

Audio files are uploaded by admin. MVP storage is local server storage. Max audio file size: 10 MB. Backend serves static uploads in MVP; Caddy/Nginx direct serving is post-MVP optimization.

## 18. Final Quiz

Every module has a final quiz.

Defaults:

- pass score: 80%
- hearts: 5
- question count: 10
- quiz source: random from module exercises

Admin can override:

- pass score
- hearts
- question count
- quiz source: random or manual
- question shuffle

If student fails final quiz, student must repeat full module practice before retrying.

## 19. Hearts

Hearts apply only in final quiz. Practice exercises do not reduce hearts. Incorrect quiz answer reduces one heart. If hearts reach 0, final quiz fails.

## 20. XP

XP is ledger-based. No direct XP mutation.

XP sources:

- correct practice answer
- practice completion
- correct final quiz answer
- final quiz pass bonus
- module completion bonus
- achievement reward

Repeated practice after failed final quiz does not duplicate XP. Final quiz retry does not duplicate XP for the same question already rewarded.

## 21. Active Days

MVP uses Active Days instead of resettable streaks. A day becomes active when student submits at least 5 answers. Correctness does not matter.

Active Days visible in:

- Student Dashboard
- Student Profile
- Parent Dashboard
- Admin Student Detail
- Leaderboards

## 22. Achievements

MVP uses fixed system achievements. Admin cannot create custom achievements in MVP.

Achievement reward:

- badge
- XP
- no confetti in MVP

Achievement unlock triggers:

- student in-app notification
- parent Telegram notification
- admin timeline event
- WebSocket event

## 23. Leaderboards

Leaderboards are authenticated-only, not public internet.

Scopes:

- global
- module-based

Periods:

- daily
- weekly
- all-time

Global score formula:

```txt
score = total_xp + completed_modules * 300 + active_days * 20
```

Module score:

```txt
module_score = module_xp + final_quiz_percentage * 5 + completion_bonus
```

Leaderboard uses infinite scroll with 10 initial entries and 10 per next page. Backend uses cursor/keyset pagination.

Student view highlights current student and shows pinned rank card if outside visible top entries. Parent view highlights selected child and dims other students.

## 24. Parent System

A student can be linked to max 2 parents. A parent can have multiple children. Parent access is read-only.

Parent can view:

- child progress
- learning path
- achievements
- active days
- leaderboard context
- premium status
- notifications

Parent cannot:

- complete exercises
- edit child progress
- grant premium
- unlink relationship

## 25. Parent Linking

Best practice flow:

```txt
Student generates parent invite
→ Parent opens code/deep link
→ Parent accepts
→ Link created
```

All parents have equal permissions. Only admin can unlink parent-child links.

## 26. Premium

Modules 1–3 are free. Modules 4–60 are premium.

Premium is admin-controlled. Payment is not in MVP.

Premium durations:

- lifetime
- 30 days
- 90 days
- 180 days
- 365 days
- custom

Grant reason is optional. Revoke reason is required.

Premium controls access. Premium does not own progress.

## 27. Premium Request

Student creates premium request. One active request only.

Blocked states for new request:

- pending
- approved
- active

Allowed to request again:

- rejected
- expired
- revoked

Admin request queue default sorting: oldest first. Admin can change sorting.

## 28. Premium Revoke

When premium is revoked:

- progress preserved
- XP preserved
- achievements preserved
- current premium module remains finishable
- next premium module locks

## 29. Moderation

Student statuses:

- active
- blocked
- deleted

Blocked student:

- cannot access student app
- hidden from public leaderboards
- progress preserved
- parent can still view
- premium timer continues

Block requires internal reason. Student-visible message is optional. If absent, generic message is shown.

## 30. Delete Requests

Student submits delete request. Reason optional. Account continues working until admin decision.

Delete request statuses:

- pending
- under_review
- approved
- rejected
- cancelled

Student can cancel only while pending. Once admin review starts, cancellation is blocked.

Approved delete = soft delete. Soft delete never physically deletes educational data.

Restore returns everything.

## 31. Notifications

Channels:

- in-app
- Telegram
- WebSocket

Templates are DB-backed and read-only in MVP. Admin cannot edit templates in MVP. Templates support Uzbek, Russian, English.

Outbound Telegram notifications are always BullMQ queued.

## 32. Realtime

Realtime uses Socket.IO.

Scope:

- leaderboards
- notifications
- admin premium request queue
- admin delete request queue
- achievements
- premium status changes

## 33. Admin Panel

Information architecture:

```txt
Dashboard
Users
  Students
  Parents
Learning
  Modules
  Exercises
  Media Library
Gamification
  Achievements
  Leaderboards
Moderation
  Premium Requests
  Delete Requests
Communication
  Notifications
Settings
```

Dashboard KPIs:

- students
- parents
- premium students
- active today
- active week
- modules completed today
- pending premium requests
- pending delete requests
- new registrations today

## 34. Audit

Audit every critical action:

- premium granted/revoked/expired
- student blocked/unblocked
- delete request approved/rejected/restored
- parent linked/unlinked
- module published/archived
- exercise published/archived
- media archived
- admin login attempts

Audit logs are immutable.

## 35. Success Criteria

MVP is production-ready when:

- 10 launch modules work
- system supports 60 modules
- Telegram Mini App auth works
- Web OTP login works
- Student learning path works
- Exercises and final quizzes work
- XP ledger works
- Achievements work
- Leaderboards work
- Parent linking works
- Premium request flow works
- Admin CMS works
- Notifications work
- Socket.IO realtime works
- Audit logs work
- PM2 deployment works


# Figma Student Flow Amendment

The Student App UI follows the uploaded Figma flow documented in [12-FIGMA_FLOW_DESIGN.md](12-FIGMA_FLOW_DESIGN.md).

Exercise answer flow is:

```txt
question shown
→ student selects option
→ selected state shown
→ student taps Tekshirish
→ backend validates answer
→ correct/wrong feedback shown
→ student taps Davom etish
```

The submit endpoint must be idempotent and must not duplicate XP on repeated taps.
