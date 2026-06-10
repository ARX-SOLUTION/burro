import { Controller, Get } from "@nestjs/common";
import { AchievementsService } from "./achievements.service";

@Controller("achievements")
export class AchievementsController {
  constructor(private readonly service: AchievementsService) {}

  @Get()
  index() { return this.service.status(); }
}
