import { z } from "zod";

export const learningModeSchema = z.enum(["practice", "final_quiz"]);
export type LearningMode = z.infer<typeof learningModeSchema>;

export const startAttemptRequestSchema = z.object({
  moduleId: z.string().min(1),
  mode: learningModeSchema
});
export type StartAttemptRequest = z.infer<typeof startAttemptRequestSchema>;

export const answerAttemptRequestSchema = z.object({
  exerciseId: z.string().min(1),
  selectedOptionId: z.string().min(1)
});
export type AnswerAttemptRequest = z.infer<typeof answerAttemptRequestSchema>;

export type AttemptStatus = "in_progress" | "completed" | "passed" | "failed";

export interface ExerciseOptionView {
  id: string;
  label: string;
}

export interface ExerciseView {
  id: string;
  prompt: string;
  audioUrl: string | null;
  options: ExerciseOptionView[];
}

export interface AttemptView {
  attemptId: string;
  moduleId: string;
  mode: LearningMode;
  status: AttemptStatus;
  heartsRemaining: number;
  answeredCount: number;
  totalExercises: number;
  xpEarned: number;
  currentExercise: ExerciseView | null;
}

export interface ExerciseFeedback {
  title: string;
  message: string;
}

export interface AnswerResultView {
  attempt: AttemptView;
  exerciseId: string;
  selectedOptionId: string;
  correctOptionId: string;
  isCorrect: boolean;
  xpDelta: number;
  feedback: ExerciseFeedback;
}

export interface ApiEnvelope<T> {
  data: T;
  meta: Record<string, unknown>;
  error: { message: string } | null;
}
