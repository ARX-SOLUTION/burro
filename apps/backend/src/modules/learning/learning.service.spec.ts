import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";
import type { AttemptView } from "@burro/shared";
import type { AttemptsService } from "../attempts/attempts.service";
import type { ExerciseCatalogPort, ModuleContentRecord } from "../attempts/attempts.ports";
import { InMemoryLearningStore } from "./adapters/in-memory-learning.store";
import type { ModuleProgressRecord } from "./learning.ports";
import { LearningService } from "./learning.service";

function moduleRecord(overrides: Partial<ModuleProgressRecord> = {}): ModuleProgressRecord {
  return {
    moduleId: "m6",
    sequenceNo: 6,
    title: "Premium module",
    description: "",
    estimatedMinutes: 10,
    premiumRequired: true,
    passScore: 80,
    heartsCount: 5,
    exerciseCount: 6,
    progressStatus: "locked",
    progressPercent: 0,
    finalQuizBestScore: null,
    finalQuizPassed: false,
    ...overrides
  };
}

function setup(record: ModuleProgressRecord, hasPremium: boolean) {
  const store = new InMemoryLearningStore();
  store.setPath("s1", [record]);
  if (hasPremium) {
    store.setActivePremium("s1");
  }
  const attemptView: AttemptView = {
    attemptId: "a1",
    moduleId: record.moduleId,
    mode: "practice",
    status: "in_progress",
    heartsRemaining: 5,
    answeredCount: 0,
    totalExercises: 6,
    xpEarned: 0,
    currentExercise: null
  };
  const attempts = { start: vi.fn().mockResolvedValue(attemptView) } as unknown as AttemptsService;
  const moduleContent: ModuleContentRecord = {
    id: record.moduleId,
    heartsCount: 5,
    passScore: 80,
    correctAnswerXp: 10,
    practiceCompletionXp: 50,
    finalQuizPassXp: 100,
    moduleCompletionXp: 150,
    exercises: [{ id: "e1", prompt: "p", audioUrl: null, options: [{ id: "o1", label: "a", isCorrect: true }] }],
    feedback: { correctTitle: "", correctMessage: "", incorrectTitle: "", incorrectMessage: "" }
  };
  const catalog: ExerciseCatalogPort = { getModule: vi.fn().mockResolvedValue(moduleContent) };
  const service = new LearningService(store, catalog, attempts);
  return { service, attempts, catalog };
}

describe("LearningService premium gate", () => {
  it("returns 403 and never starts an attempt for a premium-locked module", async () => {
    const { service, attempts } = setup(moduleRecord(), false);
    await expect(service.startPractice("s1", "m6")).rejects.toBeInstanceOf(ForbiddenException);
    await expect(service.startFinalQuiz("s1", "m6")).rejects.toBeInstanceOf(ForbiddenException);
    expect(attempts.start).not.toHaveBeenCalled();
  });

  it("blocks exercises for a premium-locked module", async () => {
    const { service, catalog } = setup(moduleRecord(), false);
    await expect(service.getExercises("s1", "m6")).rejects.toBeInstanceOf(ForbiddenException);
    expect(catalog.getModule).not.toHaveBeenCalled();
  });

  it("delegates to the attempt engine once premium access is granted", async () => {
    const { service, attempts } = setup(moduleRecord(), true);
    const view = await service.startPractice("s1", "m6");
    expect(view.attemptId).toBe("a1");
    expect(attempts.start).toHaveBeenCalledWith("s1", { moduleId: "m6", mode: "practice" });
  });

  it("starts a final_quiz attempt with the final_quiz mode", async () => {
    const { service, attempts } = setup(moduleRecord({ premiumRequired: false, progressStatus: "in_progress" }), false);
    await service.startFinalQuiz("s1", "m6");
    expect(attempts.start).toHaveBeenCalledWith("s1", { moduleId: "m6", mode: "final_quiz" });
  });

  it("404s an unknown module", async () => {
    const { service } = setup(moduleRecord(), true);
    await expect(service.getModule("s1", "does-not-exist")).rejects.toBeInstanceOf(NotFoundException);
  });

  it("reports the module result with computed accuracy", async () => {
    const store = new InMemoryLearningStore();
    store.setPath("s1", [moduleRecord({ premiumRequired: false, progressStatus: "completed" })]);
    store.setResultStats("s1", "m6", {
      xpEarned: 110,
      correctCount: 5,
      totalAnswered: 6,
      finalQuizBestScore: 90,
      finalQuizPassed: true
    });
    const service = new LearningService(store, { getModule: vi.fn() } as unknown as ExerciseCatalogPort, {
      start: vi.fn()
    } as unknown as AttemptsService);
    const result = await service.getResult("s1", "m6");
    expect(result.xpEarned).toBe(110);
    expect(result.accuracy).toBe(83); // round(5/6 * 100)
    expect(result.passed).toBe(true);
    expect(result.finalQuizBestScore).toBe(90);
  });
});
