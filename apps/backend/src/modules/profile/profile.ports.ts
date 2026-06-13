import type { PreferredLanguage } from "@burro/shared";

export interface StudentProfileRecord {
  displayName: string;
  avatarUrl: string | null;
  totalXp: number;
  activeDays: number;
  language: PreferredLanguage;
}

export interface ProfileStorePort {
  getProfile(studentId: string): Promise<StudentProfileRecord | undefined>;
  /** Updates only the preferred language; never touches progress. */
  updateLanguage(studentId: string, language: PreferredLanguage): Promise<void>;
}

export const PROFILE_STORE = Symbol("PROFILE_STORE");
