# Deployment Guide

## Runtime

- pnpm workspace
- PM2 process manager
- PostgreSQL
- Redis
- Caddy/Nginx reverse proxy

## Build

```bash
pnpm install
pnpm build
```

## PM2 start

```bash
pm2 start ecosystem.config.cjs
pm2 save
```

## PM2 reload

```bash
pnpm build
pm2 reload ecosystem.config.cjs --update-env
```

## Reverse proxy targets

- `burroarab.uz` → `127.0.0.1:4173`
- `parent.burroarab.uz` → `127.0.0.1:4174`
- `admin.burroarab.uz` → `127.0.0.1:4175`
- `api.burroarab.uz` → `127.0.0.1:3000`

## Backup before risky actions

```bash
pg_dump "$DATABASE_URL" > backup-$(date +%F-%H%M).sql
rsync -a apps/backend/uploads/ backups/uploads-$(date +%F-%H%M)/
```

## Safe deploy checklist

```bash
git status
git branch
pnpm install
pnpm build
pnpm test
pg_dump "$DATABASE_URL" > backup.sql
pnpm db:migrate
pm2 reload ecosystem.config.cjs --update-env
pm2 status
pm2 logs --lines 100
```

## Rollback

```bash
git checkout <previous-good-commit>
pnpm install
pnpm build
pm2 reload ecosystem.config.cjs --update-env
```

If migration broke production, restore DB from backup only after confirming data loss risk.
