import { Controller, Get } from "@nestjs/common";
import { ExercisesService } from "./exercises.service";

@Controller("exercises")
export class ExercisesController {
  constructor(private readonly service: ExercisesService) {}

  @Get()
  index() { return this.service.status(); }
}
