import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CheckExerciseAnswerResponseDto } from "./dto";

type TemporaryMockExerciseOption = {
  id: string;
  isCorrect: boolean;
};

type TemporaryMockExercise = {
  id: string;
  correctAnswerXp: number;
  defaultHearts: number;
  feedback: {
    correctTitle: string;
    correctMessage: string;
    incorrectTitle: string;
    incorrectPracticeMessage: string;
    incorrectQuizMessage: string;
  };
  options: TemporaryMockExerciseOption[];
};

type TemporaryMockAttemptAnswer = {
  exerciseId: string;
  selectedOptionId: string;
  correctOptionId: string;
  isCorrect: boolean;
  answeredAt: string;
};

@Injectable()
export class TemporaryStudentExerciseCheckMockService {
  // TODO: Replace this in-memory exercise catalog with Drizzle queries against exercises, exercise_translations, and exercise_options.
  private readonly exercises = new Map<string, TemporaryMockExercise>([
    [
      "exercise-ba-1",
      {
        id: "exercise-ba-1",
        correctAnswerXp: 10,
        defaultHearts: 3,
        feedback: {
          correctTitle: "Ajoyib!",
          correctMessage: "To‘g‘ri javob",
          incorrectTitle: "Yana urinib ko‘ramiz",
          incorrectPracticeMessage: "Practice mode hearts kamaytirmaydi",
          incorrectQuizMessage: "Noto‘g‘ri javob"
        },
        options: [
          { id: "option-alif", isCorrect: false },
          { id: "option-ba", isCorrect: true },
          { id: "option-ta", isCorrect: false },
          { id: "option-tha", isCorrect: false }
        ]
      }
    ]
  ]);

  // TODO: Replace this in-memory answer log with Drizzle persistence for attempts and attempt_answers.
  private readonly attemptAnswers = new Map<string, TemporaryMockAttemptAnswer[]>();

  checkExercise(params: {
    exerciseId: string;
    selectedOptionId: string;
    mode: "practice" | "final_quiz";
  }): CheckExerciseAnswerResponseDto {
    const exercise = this.exercises.get(params.exerciseId);

    if (!exercise) {
      throw new NotFoundException(`Exercise ${params.exerciseId} is not available in the temporary mock catalog`);
    }

    const correctOption = exercise.options.find((option) => option.isCorrect);

    if (!correctOption) {
      throw new NotFoundException(`Exercise ${params.exerciseId} has no correct option in the temporary mock catalog`);
    }

    const selectedOption = exercise.options.find((option) => option.id === params.selectedOptionId);

    if (!selectedOption) {
      throw new BadRequestException(`selectedOptionId ${params.selectedOptionId} does not belong to exercise ${params.exerciseId}`);
    }

    const isCorrect = selectedOption.id === correctOption.id;
    const heartsRemaining = params.mode === "final_quiz" && !isCorrect
      ? Math.max(exercise.defaultHearts - 1, 0)
      : exercise.defaultHearts;

    const answerKey = `${params.mode}:${params.exerciseId}`;
    const answers = this.attemptAnswers.get(answerKey) ?? [];

    answers.push({
      exerciseId: params.exerciseId,
      selectedOptionId: params.selectedOptionId,
      correctOptionId: correctOption.id,
      isCorrect,
      answeredAt: new Date().toISOString()
    });

    this.attemptAnswers.set(answerKey, answers);

    return {
      exerciseId: params.exerciseId,
      selectedOptionId: params.selectedOptionId,
      correctOptionId: correctOption.id,
      isCorrect,
      xpDelta: isCorrect ? exercise.correctAnswerXp : 0,
      heartsRemaining,
      feedback: isCorrect
        ? { title: exercise.feedback.correctTitle, message: exercise.feedback.correctMessage }
        : {
          title: exercise.feedback.incorrectTitle,
          message: params.mode === "practice" ? exercise.feedback.incorrectPracticeMessage : exercise.feedback.incorrectQuizMessage
        }
    };
  }
}
