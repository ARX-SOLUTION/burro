import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool);
// TODO: wire typed schema exports after migrations are finalized in ../../../docs/03-DATABASE_SCHEMA.md.
