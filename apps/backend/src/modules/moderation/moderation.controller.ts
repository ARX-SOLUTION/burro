import { Controller, Get } from "@nestjs/common";
import { ModerationService } from "./moderation.service";

@Controller("moderation")
export class ModerationController {
  constructor(private readonly service: ModerationService) {}

  @Get()
  index() { return this.service.status(); }
}
