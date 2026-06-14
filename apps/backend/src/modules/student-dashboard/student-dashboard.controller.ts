import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { CurrentStudent } from "../auth/current-student.decorator";
import { StudentDashboardService } from "./student-dashboard.service";

@Controller("student/dashboard")
@UseGuards(AuthGuard)
export class StudentDashboardController {
  constructor(private readonly service: StudentDashboardService) {}

  @Get()
  async get(@CurrentStudent() studentId: string) {
    const data = await this.service.getSummary(studentId);
    return { data };
  }
}
