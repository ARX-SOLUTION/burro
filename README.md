# Burro Fonetika — Production Docs Pack

Bu paket **pnpm workspace + PM2 + relative docs linking + agent/sub-agent/sub-skill** structure bilan tayyorlangan.

## Start here

1. [docs/00-INDEX.md](docs/00-INDEX.md)
2. [docs/01-PRODUCTION_PRD.md](docs/01-PRODUCTION_PRD.md)
3. [docs/02-TECHNICAL_ARCHITECTURE.md](docs/02-TECHNICAL_ARCHITECTURE.md)
4. [docs/03-DATABASE_SCHEMA.md](docs/03-DATABASE_SCHEMA.md)
5. [docs/04-API_SPEC.md](docs/04-API_SPEC.md)
6. [docs/09-PLANNING.md](docs/09-PLANNING.md)

## Workspace apps

- [students](apps/students/README.md) — Student Telegram Mini App + Web
- [parents](apps/parents/README.md) — Parent dashboard
- [adminpanel](apps/adminpanel/README.md) — Admin CMS / moderation
- [backend](apps/backend/README.md) — NestJS + Fastify API
- [packages/shared](packages/shared/README.md) — shared types/utils
- [packages/ui](packages/ui/README.md) — shared UI primitives

## Commands

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
pnpm test
```

Deployment with PM2:

```bash
pnpm build
pm2 start ecosystem.config.cjs
pm2 save
```

## Important

- All paths in docs are relative.
- Each app has its own `AGENT.md` and `DESIGN.md`.
- Root agents live in [docs/agents](docs/agents/README.md).
- Sub-agents live in [docs/subagents](docs/subagents/README.md).
- Sub-skills live in [docs/skills](docs/skills/README.md).


## Design Flow Added

The Student App Figma flow is documented and linked here:

- [DESIGN.md](DESIGN.md)
- [docs/12-FIGMA_FLOW_DESIGN.md](docs/12-FIGMA_FLOW_DESIGN.md)
- [docs/13-STUDENT_FLOW_IMPLEMENTATION.md](docs/13-STUDENT_FLOW_IMPLEMENTATION.md)
- [docs/design/reference-screens/README.md](docs/design/reference-screens/README.md)

Run helper:

```bash
pnpm docs:design
```
