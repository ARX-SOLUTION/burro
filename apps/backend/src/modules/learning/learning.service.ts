import { ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import type {
  AttemptView,
  ModuleCardStatus,
  ModuleDetailDto,
  ModuleExercisesResponse,
  ModuleResultDto,
  StudentPathResponse
} from "@burro/shared";
import { AttemptsService } from "../attempts/attempts.service";
import { EXERCISE_CATALOG } from "../attempts/attempts.ports";
import type { ExerciseCatalogPort } from "../attempts/attempts.ports";
import { LEARNING_STORE } from "./learning.ports";
import type { LearningStorePort, ModuleProgressRecord } from "./learning.ports";
import { mapPathStatuses, resolveStatus } from "./path-status";

@Injectable()
export class LearningService {
  constructor(
    @Inject(LEARNING_STORE) private readonly store: LearningStorePort,
    @Inject(EXERCISE_CATALOG) private readonly catalog: ExerciseCatalogPort,
    private readonly attempts: AttemptsService
  ) {}

  async getPath(studentId: string): Promise<StudentPathResponse> {
    const [records, hasPremium] = await Promise.all([
      this.store.listPath(studentId),
      this.store.hasActivePremiumGrant(studentId)
    ]);
    return { modules: mapPathStatuses(records, hasPremium) };
  }

  async getModule(studentId: string, moduleId: string): Promise<ModuleDetailDto> {
    const { record, status } = await this.resolveModule(studentId, moduleId);
    return {
      id: record.moduleId,
      sequenceNo: record.sequenceNo,
      title: record.title,
      description: record.description,
      estimatedMinutes: record.estimatedMinutes,
      status,
      progressPercent: record.progressPercent,
      premiumRequired: record.premiumRequired,
      exerciseCount: record.exerciseCount,
      passScore: record.passScore,
      heartsCount: record.heartsCount
    };
  }

  async getExercises(studentId: string, moduleId: string): Promise<ModuleExercisesResponse> {
    // Resolve to enforce existence + the premium access gate before exposing content.
    const { status } = await this.resolveModule(studentId, moduleId);
    if (status === "premium_locked") {
      throw new ForbiddenException("This module requires premium access.");
    }
    const module = await this.catalog.getModule(moduleId);
    if (!module) {
      throw new NotFoundException(`module ${moduleId} not found`);
    }
    return {
      moduleId,
      exercises: module.exercises.map((exercise) => ({
        id: exercise.id,
        prompt: exercise.prompt,
        audioUrl: exercise.audioUrl,
        options: exercise.options.map((option) => ({ id: option.id, label: option.label }))
      }))
    };
  }

  async startPractice(studentId: string, moduleId: string): Promise<AttemptView> {
    await this.assertAccessible(studentId, moduleId);
    return this.attempts.start(studentId, { moduleId, mode: "practice" });
  }

  async startFinalQuiz(studentId: string, moduleId: string): Promise<AttemptView> {
    await this.assertAccessible(studentId, moduleId);
    return this.attempts.start(studentId, { moduleId, mode: "final_quiz" });
  }

  async getResult(studentId: string, moduleId: string): Promise<ModuleResultDto> {
    const { record, status } = await this.resolveModule(studentId, moduleId);
    const stats = await this.store.getModuleResultStats(studentId, moduleId);
    const accuracy = stats.totalAnswered > 0 ? Math.round((stats.correctCount / stats.totalAnswered) * 100) : 0;
    return {
      moduleId,
      status,
      xpEarned: stats.xpEarned,
      accuracy,
      correctCount: stats.correctCount,
      totalAnswered: stats.totalAnswered,
      finalQuizBestScore: stats.finalQuizBestScore ?? record.finalQuizBestScore,
      passed: stats.finalQuizPassed || record.finalQuizPassed
    };
  }

  /** Loads a module, computes its UI status for this student, or 404s. */
  private async resolveModule(
    studentId: string,
    moduleId: string
  ): Promise<{ record: ModuleProgressRecord; status: ModuleCardStatus }> {
    const [record, hasPremium] = await Promise.all([
      this.store.getModuleProgress(studentId, moduleId),
      this.store.hasActivePremiumGrant(studentId)
    ]);
    if (!record) {
      throw new NotFoundException(`module ${moduleId} not found`);
    }
    // Same per-record rule the path uses, so detail/start/result statuses agree.
    return { record, status: resolveStatus(record, hasPremium) };
  }

  /** Throws 403 when premium gates access; never mutates progress. */
  private async assertAccessible(studentId: string, moduleId: string): Promise<void> {
    const { status } = await this.resolveModule(studentId, moduleId);
    if (status === "premium_locked") {
      throw new ForbiddenException("This module requires premium access.");
    }
  }
}
