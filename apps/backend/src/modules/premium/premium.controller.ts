import { Controller, Get, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { CurrentStudent } from "../auth/current-student.decorator";
import { PremiumService } from "./premium.service";

@Controller("student/premium")
@UseGuards(AuthGuard)
export class PremiumController {
  constructor(private readonly service: PremiumService) {}

  @Get()
  getCenter(@CurrentStudent() studentId: string) {
    return this.service.getCenter(studentId);
  }

  @Post("request")
  request(@CurrentStudent() studentId: string) {
    return this.service.requestPremium(studentId);
  }
}
