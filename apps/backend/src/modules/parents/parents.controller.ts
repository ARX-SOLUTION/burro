import { Controller, Get } from "@nestjs/common";
import { ParentsService } from "./parents.service";

@Controller("parents")
export class ParentsController {
  constructor(private readonly service: ParentsService) {}

  @Get()
  index() { return this.service.status(); }
}
