import { Global, Module } from "@nestjs/common";
import { appConfig } from "../config";
import { BurroDb, createDb } from "./client";

/**
 * Injection token for the shared Drizzle database. Resolves to null when no
 * configured feature needs PostgreSQL; consumers must fail loudly on null
 * rather than degrade silently.
 */
export const BURRO_DB = Symbol("BURRO_DB");

const databaseProvider = {
  provide: BURRO_DB,
  useFactory: (): BurroDb | null => {
    const config = appConfig();
    if (config.attemptsStore !== "drizzle" && config.auth !== "telegram") {
      return null;
    }
    if (!config.databaseUrl) {
      // loadConfig already enforces this for the drizzle store; this covers
      // telegram auth with a memory store.
      throw new Error('DATABASE_URL is required: BURRO_AUTH="telegram" upserts students in PostgreSQL.');
    }
    return createDb(config.databaseUrl);
  }
};

@Global()
@Module({
  providers: [databaseProvider],
  exports: [databaseProvider]
})
export class DatabaseModule {}
