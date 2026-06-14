import { z } from "zod";
import { UserRole } from "../enums";
import type { PreferredLanguage } from "./auth";

export const preferredLanguageSchema = z.enum(["uz", "ru", "en"]);

export const updateProfileRequestSchema = z.object({
  preferredLanguage: preferredLanguageSchema
});
export type UpdateProfileRequest = z.infer<typeof updateProfileRequestSchema>;

export interface StudentProfileDto {
  displayName: string;
  avatarUrl: string | null;
  role: UserRole;
  totalXp: number;
  activeDays: number;
  language: PreferredLanguage;
}
