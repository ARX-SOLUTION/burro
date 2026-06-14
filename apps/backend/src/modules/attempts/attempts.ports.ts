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

export interface AttemptAnswerRecord {
  attemptId: string;
  exerciseId: string;
  clientAnswerId: string;
  selectedOptionId: string;
  correctOptionId: string;
  isCorrect: boolean;
  xpDelta: number;
  answeredAt?: Date;
}

export interface XpGrantRequest {
  sourceType: string;
  sourceId: string;
  xpDelta: number;
}

export interface ApplyAnswerInput {
  /** Post-decision attempt state. `xpEarned` excludes the requested grants; the store reconciles it. */
  attempt: AttemptRecord;
  /** Answer row to record. `xpDelta` is filled by the store from the actually granted answer XP. */
  answer: Omit<AttemptAnswerRecord, "xpDelta">;
  /** XP grant tied to this answer (correct answers only). */
  answerXpGrant: XpGrantRequest | null;
  /** Completion bonus grants triggered by this answer. */
  completionXpGrants: XpGrantRequest[];
}

export interface ApplyAnswerResult {
  /** Sum of XP actually granted across all requested grants (idempotency may zero some). */
  grantedTotal: number;
  /** The persisted answer row. Replays return the original row, including its original XP delta. */
  answer: AttemptAnswerRecord;
}

export interface AttemptsStorePort {
  getAttempt(id: string): Promise<AttemptRecord | undefined>;
  getAnswerByClientAnswerId(attemptId: string, clientAnswerId: string): Promise<AttemptAnswerRecord | undefined>;
  saveAttempt(attempt: AttemptRecord): Promise<void>;
  /**
   * Atomically applies one answer: XP grants, the answer row, and the attempt
   * update succeed or fail together. Persisted `xpEarned` becomes
   * `attempt.xpEarned + grantedTotal`.
   */
  applyAnswer(input: ApplyAnswerInput): Promise<ApplyAnswerResult>;
}

export type CatalogLanguage = "uz" | "ru" | "en";

export interface CatalogLookupOptions {
  /** Explicit language override; wins over studentId. */
  language?: CatalogLanguage;
  /** When set without `language`, the catalog resolves the user's preferredLanguage. */
  studentId?: string;
}

export interface ExerciseCatalogPort {
  getModule(moduleId: string, options?: CatalogLookupOptions): Promise<ModuleContentRecord | undefined>;
}

export const ATTEMPTS_STORE = Symbol("ATTEMPTS_STORE");
export const EXERCISE_CATALOG = Symbol("EXERCISE_CATALOG");
