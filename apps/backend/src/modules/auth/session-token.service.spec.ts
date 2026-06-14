import { describe, expect, it } from "vitest";
import { UserRole } from "@burro/shared";
import { UnauthorizedError } from "./identity.ports";
import { SessionTokenService } from "./session-token.service";

const SECRET = "test-session-secret-with-at-least-32-characters";

describe("SessionTokenService", () => {
  it("verifies access tokens until they expire", () => {
    const tokens = new SessionTokenService(SECRET, { accessTokenTtlSeconds: 1 });
    const issuedAt = new Date("2026-06-12T00:00:00.000Z");
    const session = tokens.issueSession("student-1", UserRole.Student, issuedAt);

    expect(tokens.verifyAccessToken(session.accessToken, issuedAt)).toMatchObject({
      sub: "student-1",
      role: UserRole.Student,
      typ: "access"
    });
    expect(() => tokens.verifyAccessToken(session.accessToken, new Date("2026-06-12T00:00:02.000Z"))).toThrow(
      UnauthorizedError
    );
  });

  it("refreshes an expired access token with a valid refresh token and rotates the refresh token", () => {
    const tokens = new SessionTokenService(SECRET, {
      accessTokenTtlSeconds: 1,
      refreshTokenTtlSeconds: 60
    });
    const session = tokens.issueSession("student-1", UserRole.Student, new Date("2026-06-12T00:00:00.000Z"));
    const refreshed = tokens.refreshSession(session.refreshToken, new Date("2026-06-12T00:00:02.000Z"));

    expect(tokens.verifyAccessToken(refreshed.accessToken, new Date("2026-06-12T00:00:02.000Z"))).toMatchObject({
      sub: "student-1",
      typ: "access"
    });
    expect(() => tokens.refreshSession(session.refreshToken, new Date("2026-06-12T00:00:03.000Z"))).toThrow(
      UnauthorizedError
    );
  });

  it("revokes refresh tokens on logout", () => {
    const tokens = new SessionTokenService(SECRET);
    const session = tokens.issueSession("student-1", UserRole.Student);

    tokens.revokeRefreshToken(session.refreshToken);

    expect(() => tokens.refreshSession(session.refreshToken)).toThrow(UnauthorizedError);
  });
});
