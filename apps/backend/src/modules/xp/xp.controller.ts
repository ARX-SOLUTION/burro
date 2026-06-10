import { Controller, Get } from "@nestjs/common";
import { XpService } from "./xp.service";

@Controller("xp")
export class XpController {
  constructor(private readonly service: XpService) {}

  @Get()
  index() { return this.service.status(); }
}
