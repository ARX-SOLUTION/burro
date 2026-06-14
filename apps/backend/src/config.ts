import { z } from "zod";

const DEFAULT_CORS_ORIGINS = ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"];

// Keys mirror the raw env var names so validation errors point at the exact
// variable to fix. Unknown store/auth values fail parsing instead of silently
// falling back — a typo here must never downgrade durable student progress to
// an in-memory store.
const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.coerce.number().int().positive().default(4000),
    BURRO_CORS_ORIGINS: z.string().optional(),
    BURRO_ATTEMPTS_STORE: z.enum(["drizzle", "memory"]).optional(),
    DATABASE_URL: z.string().min(1).optional(),
    BURRO_AUTH: z.enum(["telegram", "dev"]).default("dev"),
    TELEGRAM_BOT_TOKEN: z.string().min(1).optional(),
    BURRO_JWT_SECRET: z.string().min(32).optional()
  })
  .superRefine((env, ctx) => {
    const attemptsStore = env.BURRO_ATTEMPTS_STORE ?? (env.NODE_ENV === "production" ? "drizzle" : "memory");
    if (attemptsStore === "drizzle" && !env.DATABASE_URL) {
      ctx.addIssue({
        code: "custom",
        path: ["DATABASE_URL"],
        message: 'required when the attempts store is "drizzle".'
      });
    }
    if (env.BURRO_AUTH === "telegram" && !env.TELEGRAM_BOT_TOKEN) {
      ctx.addIssue({
        code: "custom",
        path: ["TELEGRAM_BOT_TOKEN"],
        message: 'required when BURRO_AUTH is "telegram".'
      });
    }
    if (env.NODE_ENV === "production" && env.BURRO_AUTH === "dev") {
      ctx.addIssue({
        code: "custom",
        path: ["BURRO_AUTH"],
        message: 'dev header auth is an auth bypass in production; set BURRO_AUTH="telegram".'
      });
    }
    if (env.NODE_ENV === "production" && !env.BURRO_JWT_SECRET) {
      ctx.addIssue({
        code: "custom",
        path: ["BURRO_JWT_SECRET"],
        message: "required in production."
      });
    }
  });

const DEV_JWT_SECRET = "dev-only-burro-session-secret-change-before-production";

export interface AppConfig {
  nodeEnv: "development" | "production" | "test";
  port: number;
  corsOrigins: string[];
  attemptsStore: "drizzle" | "memory";
  databaseUrl: string | undefined;
  auth: "telegram" | "dev";
  telegramBotToken: string | undefined;
  jwtSecret: string;
}

/** Parses and validates env. Throws with every offending variable listed. */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const result = envSchema.safeParse(env);
  if (!result.success) {
    const lines = result.error.issues.map((issue) => `  ${issue.path.join(".") || "(env)"}: ${issue.message}`);
    throw new Error(`Invalid environment configuration:\n${lines.join("\n")}`);
  }
  const parsed = result.data;
  return {
    nodeEnv: parsed.NODE_ENV,
    port: parsed.PORT,
    corsOrigins: parsed.BURRO_CORS_ORIGINS
      ? parsed.BURRO_CORS_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean)
      : DEFAULT_CORS_ORIGINS,
    attemptsStore: parsed.BURRO_ATTEMPTS_STORE ?? (parsed.NODE_ENV === "production" ? "drizzle" : "memory"),
    databaseUrl: parsed.DATABASE_URL,
    auth: parsed.BURRO_AUTH,
    telegramBotToken: parsed.TELEGRAM_BOT_TOKEN,
    jwtSecret: parsed.BURRO_JWT_SECRET ?? DEV_JWT_SECRET
  };
}

let cached: AppConfig | undefined;

/**
 * Cached process.env config. main.ts calls this before Nest boots so invalid
 * env fails fast; module factories then read the same validated snapshot.
 */
export function appConfig(): AppConfig {
  cached ??= loadConfig();
  return cached;
}
