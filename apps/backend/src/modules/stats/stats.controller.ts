import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { CurrentStudent } from "../auth/current-student.decorator";
import { StatsService } from "./stats.service";

@Controller("student/stats")
@UseGuards(AuthGuard)
export class StatsController {
  constructor(private readonly service: StatsService) {}

  @Get("summary")
  getSummary(@CurrentStudent() studentId: string) {
    return this.service.getSummary(studentId);
  }
}
