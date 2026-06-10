SHELL := /bin/bash

.PHONY: install dev build lint test typecheck clean pm2-start pm2-reload pm2-logs pm2-status db-generate db-migrate db-studio

install:
	pnpm install

dev:
	pnpm dev

dev-student:
	pnpm dev:student

dev-parent:
	pnpm dev:parent

dev-admin:
	pnpm dev:admin

dev-api:
	pnpm dev:api

build:
	pnpm build

build-student:
	pnpm build:student

build-parent:
	pnpm build:parent

build-admin:
	pnpm build:admin

build-api:
	pnpm build:api

lint:
	pnpm lint

test:
	pnpm test

typecheck:
	pnpm typecheck

db-generate:
	pnpm db:generate

db-migrate:
	pnpm db:migrate

db-studio:
	pnpm db:studio

pm2-start:
	pnpm build
	pm2 start ecosystem.config.cjs

pm2-reload:
	pnpm build
	pm2 reload ecosystem.config.cjs --update-env

pm2-logs:
	pm2 logs

pm2-status:
	pm2 status

clean:
	rm -rf apps/*/dist apps/*/.vite packages/*/dist node_modules
