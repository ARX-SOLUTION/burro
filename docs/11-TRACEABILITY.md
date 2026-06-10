# Traceability Map

| Product requirement | Backend module | Tables | API | App |
|---|---|---|---|---|
| Telegram auth | AuthModule | users, web_login_codes | /auth/* | all |
| Learning path | LearningModule | modules, progress | /student/path | students |
| Exercises | ExerciseModule | exercises, options | /admin/exercises, /student/attempts | students/admin |
| Media | MediaModule | media_assets, media_usage | /admin/media | admin |
| Final quiz | QuizModule | attempts, attempt_answers | /student/modules/:id/final-quiz/start | students |
| XP | XPModule | xp_transactions, student_xp_totals | internal | students/admin |
| Active days | Analytics/XP | student_active_days | internal | all |
| Achievements | AchievementModule | achievements, student_achievements | /student/profile | all |
| Leaderboards | LeaderboardModule | leaderboard_entries | /leaderboards/* | all |
| Premium | PremiumModule | premium_requests, premium_grants | /premium/* | all |
| Parent links | ParentModule | parent_student_links, parent_invites | /parent/* | parent/admin |
| Notifications | NotificationModule | notifications | /notifications | all |
| Moderation | ModerationModule | delete_requests, audit_logs | /admin/* | admin |
| Audit | AuditModule | audit_logs | /admin/audit-logs | admin |


## Figma Flow Traceability

| Figma Screen | Documentation | Implementation Area |
|---|---|---|
| Welcome | [12-FIGMA_FLOW_DESIGN.md](12-FIGMA_FLOW_DESIGN.md#91-welcome-screen) | `apps/students/src/features/auth` |
| Login | [12-FIGMA_FLOW_DESIGN.md](12-FIGMA_FLOW_DESIGN.md#92-login-screen) | `apps/students/src/features/auth` |
| Home | [12-FIGMA_FLOW_DESIGN.md](12-FIGMA_FLOW_DESIGN.md#93-home-dashboard) | `apps/students/src/features/dashboard` |
| Modules Grid | [12-FIGMA_FLOW_DESIGN.md](12-FIGMA_FLOW_DESIGN.md#94-modules-grid) | `apps/students/src/features/modules` |
| Modules Path | [12-FIGMA_FLOW_DESIGN.md](12-FIGMA_FLOW_DESIGN.md#95-modules-path) | `apps/students/src/features/modules` |
| Exercise | [12-FIGMA_FLOW_DESIGN.md](12-FIGMA_FLOW_DESIGN.md#96-exercise-letter-to-sound) | `apps/students/src/features/learning` |
| Listen Exercise | [12-FIGMA_FLOW_DESIGN.md](12-FIGMA_FLOW_DESIGN.md#97-exercise-listen-and-choose) | `apps/students/src/features/learning` |
| Sound Info | [12-FIGMA_FLOW_DESIGN.md](12-FIGMA_FLOW_DESIGN.md#99-sound-info-screen) | `apps/students/src/features/learning` |
| Module Completed | [12-FIGMA_FLOW_DESIGN.md](12-FIGMA_FLOW_DESIGN.md#911-module-completion) | `apps/students/src/features/modules` |
| Statistics | [12-FIGMA_FLOW_DESIGN.md](12-FIGMA_FLOW_DESIGN.md#912-statistics-screen) | `apps/students/src/features/stats` |
| Profile Language | [12-FIGMA_FLOW_DESIGN.md](12-FIGMA_FLOW_DESIGN.md#913-profile--language-bottom-sheet) | `apps/students/src/features/profile` |
| Leaderboard | [12-FIGMA_FLOW_DESIGN.md](12-FIGMA_FLOW_DESIGN.md#914-leaderboard) | `apps/students/src/features/leaderboard` |

Exercise UI amendment: Figma flow requires selected state and explicit **Tekshirish** before submit.
