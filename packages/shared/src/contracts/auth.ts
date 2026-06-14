import { z } from "zod";
import { UserRole } from "../enums";

export const refreshSessionRequestSchema = z.object({
  refreshToken: z.string().min(1)
});
export type RefreshSessionRequest = z.infer<typeof refreshSessionRequestSchema>;

export const logoutSessionRequestSchema = z.object({
  refreshToken: z.string().min(1)
});
export type LogoutSessionRequest = z.infer<typeof logoutSessionRequestSchema>;

export type UserStatus = "active" | "blocked" | "deleted";
export type PreferredLanguage = "uz" | "ru" | "en";

export interface AuthUserProfile {
  displayName: string;
  telegramFirstName: string;
  telegramLastName: string | null;
  telegramUsername: string | null;
  telegramAvatarUrl: string | null;
  preferredLanguage: PreferredLanguage;
}

export interface AuthUserSummary {
  id: string;
  role: UserRole;
  status: UserStatus;
  profile: AuthUserProfile;
}

export interface AuthSessionTokens {
  tokenType: "Bearer";
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
}

export interface AuthSessionResponse {
  session: AuthSessionTokens;
  user: AuthUserSummary;
}

export interface AuthLogoutResponse {
  revoked: boolean;
}

export interface AuthMeResponse {
  user: AuthUserSummary;
}
