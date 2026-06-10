import { Controller, Get } from "@nestjs/common";
import { LearningService } from "./learning.service";

@Controller("learning")
export class LearningController {
  constructor(private readonly service: LearningService) {}

  @Get()
  index() { return this.service.status(); }
}
