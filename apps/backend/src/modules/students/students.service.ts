import { BadRequestException, Injectable } from "@nestjs/common";
import type { CheckExerciseAnswerDto, CheckExerciseAnswerResponseDto } from "./dto";
import { TemporaryStudentExerciseCheckMockService } from "./temporary-student-exercise-check-mock.service";

@Injectable()
export class StudentsService {
  constructor(private readonly exerciseCheckMock: TemporaryStudentExerciseCheckMockService) {}

  // TODO: Implement students business rules from ../../../../../docs/04-API_SPEC.md and permissions from ../../../../../docs/05-PERMISSION_MATRIX.md.
  status() {
    return { module: "students", status: "skeleton" };
  }

  // TODO: Replace mock-backed exercise checking with Drizzle-backed reads/writes for exercises, exercise_options, attempts, and attempt_answers.
  checkExerciseAnswer(
    exerciseId: string,
    dto: Partial<CheckExerciseAnswerDto> = {}
  ): CheckExerciseAnswerResponseDto {
    if (!exerciseId.trim()) {
      throw new BadRequestException("exerciseId is required");
    }

    if (!dto.selectedOptionId?.trim()) {
      throw new BadRequestException("selectedOptionId is required");
    }

    if (dto.mode !== "practice" && dto.mode !== "final_quiz") {
      throw new BadRequestException("mode must be practice or final_quiz");
    }

    return this.exerciseCheckMock.checkExercise({
      exerciseId,
      selectedOptionId: dto.selectedOptionId,
      mode: dto.mode
    });
  }
}
