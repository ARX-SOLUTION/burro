# Technical Architecture

## Stack

- Monorepo: pnpm workspace
- Backend: NestJS + Fastify
- Database: PostgreSQL
- ORM: Drizzle ORM
- Frontend: Vite + React + TypeScript + Tailwind
- State/server cache: TanStack Query
- Realtime: Socket.IO
- Queue: BullMQ
- Cache: Redis
- Process manager: PM2

## Repository structure

```txt
burro/
├─ apps/
│  ├─ students/
│  ├─ parents/
│  ├─ adminpanel/
│  └─ backend/
├─ packages/
│  ├─ shared/
│  └─ ui/
├─ docs/
├─ package.json
├─ pnpm-workspace.yaml
├─ Makefile
└─ ecosystem.config.cjs
```

## Backend modules

- AuthModule
- UsersModule
- StudentModule
- ParentModule
- AdminModule
- LearningModule
- ExerciseModule
- MediaModule
- QuizModule
- XPModule
- AchievementModule
- LeaderboardModule
- PremiumModule
- ModerationModule
- NotificationModule
- TelegramModule
- SocketModule
- AuditModule
- AnalyticsModule

## App boundaries

Student app never imports admin screens. Parent app is read-only. Admin panel is the only app allowed to mutate content, premium, moderation, and parent links.

## Relative module ownership

- `apps/backend/src/modules/auth` → authentication and sessions
- `apps/backend/src/modules/learning` → modules/path/progress
- `apps/backend/src/modules/exercises` → global exercise library
- `apps/backend/src/modules/media` → global media library
- `apps/backend/src/modules/premium` → requests, grants, expiration
- `apps/backend/src/modules/moderation` → block/delete/restore
- `apps/backend/src/modules/notifications` → in-app/telegram/socket notifications
- `apps/backend/src/modules/realtime` → Socket.IO gateways

## Event-driven rule

Domain services emit domain events. Side effects listen through handlers:

- XP awarded → leaderboard update
- module completed → achievement check + notification
- premium approved → notification + socket event
- delete approved → soft delete + notification

## Deployment

PM2 runs four processes:

- `burro-api`
- `burro-students-preview`
- `burro-parents-preview`
- `burro-admin-preview`

Production should put Caddy/Nginx in front of preview servers and API.

## Uploads

MVP stores uploads in local storage. If Docker is used, uploads must be a persistent mounted volume.

## Scaling

Phase 1: single VPS, one PostgreSQL, one Redis, one API process.
Phase 2: Redis adapter for Socket.IO, API replicas, Caddy/Nginx static upload serving, S3-compatible media storage.
