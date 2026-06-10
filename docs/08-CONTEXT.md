# Burro Context

## Product

Burro Fonetika is an Arabic phonetics learning platform for children aged 4–14.

## Architecture

- apps/students: Student app
- apps/parents: Parent app
- apps/adminpanel: Admin CMS
- apps/backend: API
- packages/shared: shared types
- packages/ui: shared UI

## Core decisions

- pnpm workspace
- PM2 deployment
- NestJS + Fastify
- PostgreSQL + Drizzle
- Vite + React + TypeScript + Tailwind
- Socket.IO realtime
- BullMQ notifications
- Redis cache/queue
- App-level RBAC, no RLS in MVP
- 60 modules full course
- 10 modules launch content
- Modules 1–3 free
- Modules 4–60 premium
- Premium admin controlled
- Parent max 2 per student
- Student generates parent invite
- Admin-only unlink
- Soft delete only

## Exercise types

- find_letter
- find_sound
- listen_find_letter
- listen_find_sound

## Attempt

An Attempt is one run of a lesson module's exercises by a student in one mode (practice or final_quiz). The Attempt owns hearts, answer finality, XP idempotency, and pass/fail (≥ 80%). Contract: `@burro/shared` contracts/attempts; rules: backend attempts module.

## Gamification

- XP ledger
- Active Days
- Fixed achievements
- Leaderboards
- Final quiz hearts

## Critical rule

Progress belongs to student. Premium controls access only. Never delete educational progress due to premium, block, or soft delete.
