import { Controller, Get } from "@nestjs/common";
import { RealtimeService } from "./realtime.service";

@Controller("realtime")
export class RealtimeController {
  constructor(private readonly service: RealtimeService) {}

  @Get()
  index() { return this.service.status(); }
}
