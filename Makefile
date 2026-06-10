install:
	pnpm install

dev:
	pnpm dev

dev-students:
	pnpm dev:students

dev-parents:
	pnpm dev:parents

dev-admin:
	pnpm dev:admin

dev-backend:
	pnpm dev:backend

build:
	pnpm build

build-students:
	pnpm build:students

build-parents:
	pnpm build:parents

build-admin:
	pnpm build:admin

build-backend:
	pnpm build:backend

lint:
	pnpm lint

typecheck:
	pnpm typecheck

test:
	pnpm test

pm2-start:
	pm2 start ecosystem.config.cjs

pm2-reload:
	pm2 reload ecosystem.config.cjs

pm2-logs:
	pm2 logs
