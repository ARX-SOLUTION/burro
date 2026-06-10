export type ExerciseMode = "practice" | "final_quiz";

export interface CheckExerciseAnswerDto {
  selectedOptionId: string;
  mode: ExerciseMode;
}

export interface ExerciseFeedbackDto {
  title: string;
  message: string;
}

export interface CheckExerciseAnswerResponseDto {
  exerciseId: string;
  selectedOptionId: string;
  correctOptionId: string;
  isCorrect: boolean;
  xpDelta: number;
  heartsRemaining: number;
  feedback: ExerciseFeedbackDto;
}
