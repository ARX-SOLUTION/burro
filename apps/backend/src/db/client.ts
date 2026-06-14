import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

/**
 * Builds the Drizzle database for a connection string. No import-time pool:
 * DatabaseModule decides whether a database is needed at all.
 */
export function createDb(connectionString: string) {
  const pool = new Pool({
    connectionString,
    max: 20,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000
  });
  return drizzle(pool, { schema });
}

export type BurroDb = ReturnType<typeof createDb>;
