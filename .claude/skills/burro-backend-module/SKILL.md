---
name: burro-backend-module
description: Use when implementing or refactoring Burro NestJS modules, services, ports, adapters, Fastify integration, Socket.IO gateways, queues, or backend tests.
---

# Burro Backend Module

Procedure:
1. Locate the nearest existing module pattern before editing.
2. Read the relevant API, schema, and permission docs.
3. Keep controllers thin, services explicit, and persistence behind clear ports/adapters when useful.
4. Preserve educational progress and XP idempotency.
5. Add or update focused tests for changed behavior.
6. Run `pnpm --filter @burro/backend test`, `typecheck`, or `build` as narrowly as possible.

Avoid:
- Cross-app imports.
- Undocumented DTO fields.
- Business logic in controllers.
- Hard deletes of learning records.
