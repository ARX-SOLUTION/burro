import { Controller, Get } from "@nestjs/common";
import { MediaService } from "./media.service";

@Controller("media")
export class MediaController {
  constructor(private readonly service: MediaService) {}

  @Get()
  index() { return this.service.status(); }
}
