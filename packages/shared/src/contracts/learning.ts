import type { ExerciseView } from "./attempts";

/** The five UI states a module card can present on the learning path. */
export type ModuleCardStatus = "completed" | "current" | "available" | "locked" | "premium_locked";

export interface ModuleCardDto {
  id: string;
  sequenceNo: number;
  title: string;
  description: string;
  estimatedMinutes: number | null;
  status: ModuleCardStatus;
  progressPercent: number;
  premiumRequired: boolean;
}

export interface StudentPathResponse {
  modules: ModuleCardDto[];
}

export interface ModuleDetailDto {
  id: string;
  sequenceNo: number;
  title: string;
  description: string;
  estimatedMinutes: number | null;
  status: ModuleCardStatus;
  progressPercent: number;
  premiumRequired: boolean;
  exerciseCount: number;
  passScore: number;
  heartsCount: number;
}

export interface ModuleExercisesResponse {
  moduleId: string;
  exercises: ExerciseView[];
}

export interface ModuleResultDto {
  moduleId: string;
  status: ModuleCardStatus;
  xpEarned: number;
  accuracy: number;
  correctCount: number;
  totalAnswered: number;
  finalQuizBestScore: number | null;
  passed: boolean;
}
