import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { updateProfileRequestSchema } from "@burro/shared";
import type { UpdateProfileRequest } from "@burro/shared";
import { ZodValidationPipe } from "../../common/zod-validation.pipe";
import { AuthGuard } from "../auth/auth.guard";
import { CurrentStudent } from "../auth/current-student.decorator";
import { ProfileService } from "./profile.service";

@Controller("student/profile")
@UseGuards(AuthGuard)
export class ProfileController {
  constructor(private readonly service: ProfileService) {}

  @Get()
  get(@CurrentStudent() studentId: string) {
    return this.service.getProfile(studentId);
  }

  @Patch()
  update(
    @CurrentStudent() studentId: string,
    @Body(new ZodValidationPipe(updateProfileRequestSchema)) body: UpdateProfileRequest
  ) {
    return this.service.updateProfile(studentId, body);
  }
}
