import { Controller, Get } from "@nestjs/common";
import { StudentsService } from "./students.service";

@Controller("students")
export class StudentsController {
  constructor(private readonly service: StudentsService) {}

  @Get()
  index() { return this.service.status(); }
}
