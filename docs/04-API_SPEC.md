# API Spec

Base URL: `https://api.burroarab.uz`

## Conventions

- Auth: HTTP-only cookie or bearer session token.
- Response envelope:

```json
{
  "data": {},
  "meta": {},
  "error": null
}
```

- Errors use HTTP status codes.
- All admin mutations are audited.

## Auth

### POST /auth/telegram-miniapp/login

Validates Telegram initData and returns session.

### POST /auth/web-code/request

Internal/bot-created web OTP request.

### POST /auth/web-code/verify

Verifies 2-minute OTP.

### POST /auth/refresh

Refreshes session.

### POST /auth/logout

Revokes session.

### GET /auth/me

Returns current user, role, permissions, profile summary.

## Student

### GET /student/dashboard

Returns dashboard summary:

- current module
- XP
- active days
- achievements preview
- premium status
- notifications count
- level info (derived from XP)

### GET /student/profile

Returns student profile.

### PATCH /student/profile

Updates display name, full name, language.

### GET /student/path

Returns 60-module learning path with states.

### GET /student/modules/:moduleId

Returns module explanation and progress.

### POST /student/modules/:moduleId/start

Starts/continues module practice.

### GET /student/modules/:moduleId/exercises

Returns practice exercises.

### POST /student/attempts/start

Starts practice or final quiz attempt.

### POST /student/attempts/:attemptId/answer

Submits selected option. Selection is final.

### POST /student/modules/:moduleId/final-quiz/start

Starts final quiz.

### GET /student/modules/:moduleId/result

Returns module result.

### GET /student/premium

Returns premium center.

### POST /student/premium/request

Creates premium request if allowed.

### POST /student/delete-request

Creates delete request.

### POST /student/delete-request/:id/cancel

Cancels only if pending.

## Parent

### GET /parent/dashboard

Returns linked children summary.

### GET /parent/children

Lists linked children.

### GET /parent/children/:studentId/dashboard

Returns child dashboard.

### GET /parent/children/:studentId/path

Readonly learning path.

### GET /parent/children/:studentId/leaderboard

Leaderboard with selected child highlight and other students dimmed.

### GET /parent/children/:studentId/achievements

Child achievement history.

### GET /parent/children/:studentId/premium

Child premium status.

## Admin Dashboard

### GET /admin/dashboard

Returns KPI cards.

## Admin Students

### GET /admin/students

Search/filter students.

Filters:

- status
- premium status
- current module
- XP range
- active days range

### GET /admin/students/:studentId

Full student detail.

### PATCH /admin/students/:studentId/profile

Updates full name.

### POST /admin/students/:studentId/block

Requires internal reason. Optional student message.

### POST /admin/students/:studentId/unblock

Unblocks student.

### POST /admin/students/:studentId/restore

Restores deleted student.

## Admin Parent Links

### POST /admin/parent-links

Creates link manually if needed.

### DELETE /admin/parent-links/:id

Admin-only unlink.

## Admin Modules

### GET /admin/modules

List modules.

### POST /admin/modules

Create draft module.

### GET /admin/modules/:id

Module detail.

### PATCH /admin/modules/:id

Update settings/translations.

### POST /admin/modules/:id/publish

Publish with validation.

### POST /admin/modules/:id/archive

Archive module.

### POST /admin/modules/:id/exercises

Attach existing exercise.

### DELETE /admin/modules/:id/exercises/:exerciseId

Detach exercise.

## Admin Exercises

### GET /admin/exercises

Search/filter exercise library.

Filters:

- type
- tags
- status
- usage count
- module usage

### POST /admin/exercises

Create draft exercise.

### GET /admin/exercises/:id

Exercise detail.

### PATCH /admin/exercises/:id

Update exercise.

### POST /admin/exercises/:id/publish

Publish exercise.

### POST /admin/exercises/:id/archive

Archive exercise.

## Admin Media

### GET /admin/media

Search/filter media library.

### POST /admin/media/upload

Upload media. Audio max 10 MB.

### POST /admin/media/:id/archive

Archive media.

## Admin Premium

### GET /admin/premium/requests

Queue; default oldest first.

### GET /admin/premium/requests/:id

Review snapshot.

### POST /admin/premium/requests/:id/approve

Approve and grant premium duration.

### POST /admin/premium/requests/:id/reject

Reject. Reject reason required and visible to student/parent.

### POST /admin/students/:studentId/premium/grant

Direct grant.

### POST /admin/students/:studentId/premium/revoke

Revoke. Reason required.

## Admin Delete Requests

### GET /admin/delete-requests

Queue.

### GET /admin/delete-requests/:id

Review.

### POST /admin/delete-requests/:id/start-review

Changes status to under_review.

### POST /admin/delete-requests/:id/approve

Soft deletes student.

### POST /admin/delete-requests/:id/reject

Rejects request. Internal reason only.

## Leaderboards

### GET /leaderboards/global

Query:

- period=daily|weekly|all_time
- limit=10
- cursor

### GET /leaderboards/modules/:moduleId

Module leaderboard.

### GET /leaderboards/me

Current student pinned rank card.

## Notifications

### GET /notifications

Current user notification inbox.

### PATCH /notifications/:id/read

Mark read.

## Admin Audit

### GET /admin/audit-logs

Search/filter audit logs.
