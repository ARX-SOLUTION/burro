import { Injectable } from "@nestjs/common";
import { UserRole } from "@burro/shared";
import type { AuthUserRecord, AuthUserStorePort } from "../auth-user.ports";

@Injectable()
export class InMemoryAuthUserStore implements AuthUserStorePort {
  private readonly users = new Map<string, AuthUserRecord>();

  setUser(user: AuthUserRecord): void {
    this.users.set(user.id, user);
  }

  async getUserById(userId: string): Promise<AuthUserRecord | undefined> {
    return this.users.get(userId) ?? {
      id: userId,
      role: UserRole.Student,
      status: "active",
      telegramFirstName: userId,
      telegramLastName: null,
      telegramUsername: null,
      telegramAvatarUrl: null,
      preferredLanguage: "uz"
    };
  }
}
