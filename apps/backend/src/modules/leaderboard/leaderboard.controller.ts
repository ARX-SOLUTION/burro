import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { leaderboardQuerySchema } from "@burro/shared";
import type { LeaderboardQuery } from "@burro/shared";
import { ZodValidationPipe } from "../../common/zod-validation.pipe";
import { AuthGuard } from "../auth/auth.guard";
import { CurrentStudent } from "../auth/current-student.decorator";
import { LeaderboardService } from "./leaderboard.service";

@Controller("leaderboards")
@UseGuards(AuthGuard)
export class LeaderboardController {
  constructor(private readonly service: LeaderboardService) {}

  @Get("global")
  getGlobal(
    @CurrentStudent() studentId: string,
    @Query(new ZodValidationPipe(leaderboardQuerySchema)) query: LeaderboardQuery
  ) {
    return this.service.getGlobal(studentId, query);
  }

  @Get("me")
  getMe(
    @CurrentStudent() studentId: string,
    @Query(new ZodValidationPipe(leaderboardQuerySchema)) query: LeaderboardQuery
  ) {
    return this.service.getMe(studentId, query);
  }
}
