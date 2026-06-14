import { Injectable } from "@nestjs/common";
import type { PreferredLanguage } from "@burro/shared";
import type { ProfileStorePort, StudentProfileRecord } from "../profile.ports";

@Injectable()
export class InMemoryProfileStore implements ProfileStorePort {
  private readonly profiles = new Map<string, StudentProfileRecord>();

  /** Test helper: seed a profile record. */
  setProfile(studentId: string, record: StudentProfileRecord): void {
    this.profiles.set(studentId, record);
  }

  async getProfile(studentId: string): Promise<StudentProfileRecord | undefined> {
    return this.profiles.get(studentId);
  }

  async updateLanguage(studentId: string, language: PreferredLanguage): Promise<void> {
    const existing = this.profiles.get(studentId);
    if (existing) {
      this.profiles.set(studentId, { ...existing, language });
    }
  }
}
