import { describe, expect, it } from "vitest";
import { loadConfig } from "./config";

describe("loadConfig", () => {
  it("applies development defaults", () => {
    expect(loadConfig({})).toEqual({
      nodeEnv: "development",
      port: 4000,
      corsOrigins: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
      attemptsStore: "memory",
      databaseUrl: undefined,
      auth: "dev",
      telegramBotToken: undefined,
      jwtSecret: "dev-only-burro-session-secret-change-before-production"
    });
  });

  it("defaults to the drizzle store in production", () => {
    const config = loadConfig({
      NODE_ENV: "production",
      DATABASE_URL: "postgres://localhost/burro",
      BURRO_AUTH: "telegram",
      TELEGRAM_BOT_TOKEN: "123:token",
      BURRO_JWT_SECRET: "production-session-secret-with-at-least-32-characters"
    });
    expect(config.attemptsStore).toBe("drizzle");
    expect(config.databaseUrl).toBe("postgres://localhost/burro");
  });

  it("fails when the drizzle store has no DATABASE_URL", () => {
    expect(() => loadConfig({ BURRO_ATTEMPTS_STORE: "drizzle" })).toThrow(/DATABASE_URL/);
  });

  it("fails on an unknown attempts store value instead of falling back to memory", () => {
    expect(() => loadConfig({ BURRO_ATTEMPTS_STORE: "drizle", DATABASE_URL: "postgres://localhost/burro" })).toThrow(
      /BURRO_ATTEMPTS_STORE/
    );
  });

  it("fails when telegram auth has no bot token", () => {
    expect(() => loadConfig({ BURRO_AUTH: "telegram" })).toThrow(/TELEGRAM_BOT_TOKEN/);
  });

  it("fails when production uses dev header auth", () => {
    expect(() =>
      loadConfig({
        NODE_ENV: "production",
        DATABASE_URL: "postgres://localhost/burro",
        BURRO_JWT_SECRET: "production-session-secret-with-at-least-32-characters"
      })
    ).toThrow(/BURRO_AUTH/);
  });

  it("fails when production has no JWT secret", () => {
    expect(() =>
      loadConfig({
        NODE_ENV: "production",
        DATABASE_URL: "postgres://localhost/burro",
        BURRO_AUTH: "telegram",
        TELEGRAM_BOT_TOKEN: "123:token"
      })
    ).toThrow(/BURRO_JWT_SECRET/);
  });

  it("parses comma-separated cors origins, trimming blanks", () => {
    const config = loadConfig({ BURRO_CORS_ORIGINS: " https://a.example.com, https://b.example.com ,," });
    expect(config.corsOrigins).toEqual(["https://a.example.com", "https://b.example.com"]);
  });

  it("coerces PORT to a number", () => {
    expect(loadConfig({ PORT: "8080" }).port).toBe(8080);
  });
});
