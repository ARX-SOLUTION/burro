import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { UserRole } from "@burro/shared";
import type { StudentProfileDto, UpdateProfileRequest } from "@burro/shared";
import { PROFILE_STORE } from "./profile.ports";
import type { ProfileStorePort } from "./profile.ports";

@Injectable()
export class ProfileService {
  constructor(@Inject(PROFILE_STORE) private readonly store: ProfileStorePort) {}

  async getProfile(studentId: string): Promise<StudentProfileDto> {
    const record = await this.store.getProfile(studentId);
    if (!record) {
      throw new NotFoundException("Student profile not found.");
    }
    return {
      displayName: record.displayName,
      avatarUrl: record.avatarUrl,
      role: UserRole.Student,
      totalXp: record.totalXp,
      activeDays: record.activeDays,
      language: record.language
    };
  }

  async updateProfile(studentId: string, body: UpdateProfileRequest): Promise<StudentProfileDto> {
    await this.store.updateLanguage(studentId, body.preferredLanguage);
    return this.getProfile(studentId);
  }
}
