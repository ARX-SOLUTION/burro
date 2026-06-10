import { AttemptStatus, LearningMode } from "@burro/shared";

export interface ExerciseOptionRecord {
  id: string;
  label: string;
  isCorrect: boolean;
}

export interface ExerciseRecord {
  id: string;
  prompt: string;
  audioUrl: string | null;
  options: ExerciseOptionRecord[];
}

export interface ModuleContentRecord {
  id: string;
  heartsCount: number;
  passScore: number;
  correctAnswerXp: number;
  practiceCompletionXp: number;
  finalQuizPassXp: number;
  moduleCompletionXp: number;
  exercises: ExerciseRecord[];
  feedback: {
    correctTitle: string;
    correctMessage: string;
    incorrectTitle: string;
    incorrectMessage: string;
  };
}

export interface AttemptRecord {
  id: string;
  studentId: string;
  moduleId: string;
  mode: LearningMode;
  status: AttemptStatus;
  heartsRemaining: number;
  exerciseIds: string[];
  answeredExerciseIds: string[];
  correctCount: number;
  xpEarned: number;
}

export interface AttemptsStorePort {
  getAttempt(id: string): AttemptRecord | undefined;
  saveAttempt(attempt: AttemptRecord): void;
  grantXpOnce(studentId: string, sourceType: string, sourceId: string, xpDelta: number): number;
}

export interface ExerciseCatalogPort {
  getModule(moduleId: string): ModuleContentRecord | undefined;
}

export const ATTEMPTS_STORE = Symbol("ATTEMPTS_STORE");
export const EXERCISE_CATALOG = Symbol("EXERCISE_CATALOG");
