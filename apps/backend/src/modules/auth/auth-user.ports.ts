import { UserRole } from "@burro/shared";
import type { PreferredLanguage, UserStatus } from "@burro/shared";

export interface AuthUserRecord {
  id: string;
  role: UserRole;
  status: UserStatus;
  telegramFirstName: string;
  telegramLastName: string | null;
  telegramUsername: string | null;
  telegramAvatarUrl: string | null;
  preferredLanguage: PreferredLanguage;
}

export interface AuthUserStorePort {
  getUserById(userId: string): Promise<AuthUserRecord | undefined>;
}

export const AUTH_USER_STORE = Symbol("AUTH_USER_STORE");
