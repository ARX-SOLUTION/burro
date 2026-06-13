/** A module row joined with the student's progress and localized text. */
export interface ModuleProgressRecord {
  moduleId: string;
  sequenceNo: number;
  title: string;
  description: string;
  estimatedMinutes: number | null;
  premiumRequired: boolean;
  passScore: number;
  heartsCount: number;
  exerciseCount: number;
  /** student_module_progress.status, or null when the student has no row. */
  progressStatus: "not_started" | "in_progress" | "completed" | "locked" | null;
  progressPercent: number;
  finalQuizBestScore: number | null;
  finalQuizPassed: boolean;
}

export interface ModuleResultStats {
  xpEarned: number;
  correctCount: number;
  totalAnswered: number;
  finalQuizBestScore: number | null;
  finalQuizPassed: boolean;
}

export interface LearningStorePort {
  /**
   * Published modules ⨝ progress ⨝ translations, ordered by sequence_no. Text is
   * resolved by the student's preferred language with a uz fallback.
   */
  listPath(studentId: string): Promise<ModuleProgressRecord[]>;
  getModuleProgress(studentId: string, moduleId: string): Promise<ModuleProgressRecord | undefined>;
  hasActivePremiumGrant(studentId: string): Promise<boolean>;
  /** Aggregated attempt stats for a module's completion summary. */
  getModuleResultStats(studentId: string, moduleId: string): Promise<ModuleResultStats>;
}

export const LEARNING_STORE = Symbol("LEARNING_STORE");
