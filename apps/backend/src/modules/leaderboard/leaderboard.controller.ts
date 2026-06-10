import { Controller, Get } from "@nestjs/common";
import { LeaderboardService } from "./leaderboard.service";

@Controller("leaderboard")
export class LeaderboardController {
  constructor(private readonly service: LeaderboardService) {}

  @Get()
  index() { return this.service.status(); }
}
