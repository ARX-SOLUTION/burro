import { describe, expect, it } from "vitest";
import { UserRole } from "@burro/shared";
import { InMemoryAuthUserStore } from "./adapters/in-memory-auth-user.store";
import { AuthService } from "./auth.service";
import { SessionTokenService } from "./session-token.service";

const SECRET = "test-session-secret-with-at-least-32-characters";

function setup() {
  const tokens = new SessionTokenService(SECRET);
  const users = new InMemoryAuthUserStore();
  const service = new AuthService(tokens, users);
  return { service, tokens, users };
}

describe("AuthService", () => {
  it("returns role and profile basics from me", async () => {
    const { service, users } = setup();
    users.setUser({
      id: "student-1",
      role: UserRole.Student,
      status: "active",
      telegramFirstName: "Amina",
      telegramLastName: "Karimova",
      telegramUsername: "amina",
      telegramAvatarUrl: "https://example.com/avatar.png",
      preferredLanguage: "uz"
    });

    const result = await service.me({ userId: "student-1", role: UserRole.Student });

    expect(result.user).toMatchObject({
      id: "student-1",
      role: UserRole.Student,
      status: "active",
      profile: {
        displayName: "Amina",
        telegramFirstName: "Amina",
        telegramUsername: "amina",
        preferredLanguage: "uz"
      }
    });
  });

  it("refreshes a session and revokes the old refresh token", async () => {
    const { service } = setup();
    const original = await service.createSession({ userId: "student-1", role: UserRole.Student });
    const refreshed = await service.refresh({ refreshToken: original.session.refreshToken });

    expect(refreshed.user.id).toBe("student-1");
    expect(refreshed.session.accessToken).not.toBe(original.session.accessToken);
    await expect(service.refresh({ refreshToken: original.session.refreshToken })).rejects.toThrow();
  });

  it("logout revokes the refresh token", async () => {
    const { service } = setup();
    const original = await service.createSession({ userId: "student-1", role: UserRole.Student });

    await expect(service.logout({ refreshToken: original.session.refreshToken })).resolves.toEqual({ revoked: true });
    await expect(service.refresh({ refreshToken: original.session.refreshToken })).rejects.toThrow();
  });
});
