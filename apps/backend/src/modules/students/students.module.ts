import { Module } from "@nestjs/common";
import { StudentsController } from "./students.controller";
import { StudentsService } from "./students.service";
import { TemporaryStudentExerciseCheckMockService } from "./temporary-student-exercise-check-mock.service";

@Module({ controllers: [StudentsController], providers: [StudentsService, TemporaryStudentExerciseCheckMockService], exports: [StudentsService] })
export class StudentsModule {}
