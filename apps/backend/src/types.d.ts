declare const process: { env: Record<string, string | undefined> };
declare module "drizzle-orm/node-postgres" {
  export function drizzle(pool: unknown): unknown;
}
