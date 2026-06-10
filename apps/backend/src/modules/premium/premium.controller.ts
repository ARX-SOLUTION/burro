import { Controller, Get } from "@nestjs/common";
import { PremiumService } from "./premium.service";

@Controller("premium")
export class PremiumController {
  constructor(private readonly service: PremiumService) {}

  @Get()
  index() { return this.service.status(); }
}
