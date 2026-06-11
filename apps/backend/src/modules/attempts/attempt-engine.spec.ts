import { describe, expect, it } from "vitest";
import { AttemptView } from "@burro/shared";
import { InMemoryAttemptsStore } from "./adapters/in-memory-attempts.store";
import { InMemoryExerciseCatalog } from "./adapters/in-memory-exercise.catalog";
import { AttemptEngine, AttemptError } from "./attempt-engine";

const MODULE_ID = "module-letters-1";
const STUDENT_ID = "student-test";

function setup() {
  const store = new InMemoryAttemptsStore();
  const catalog = new InMemoryExerciseCatalog();
  const engine = new AttemptEngine(store, catalog);
  return { store, catalog, engine };
}

function getModule(catalog: InMemoryExerciseCatalog) {
  const module = catalog.getModule(MODULE_ID);
  if (!module) throw new Error("seed module missing");
  return module;
}

function correctOptionId(catalog: InMemoryExerciseCatalog, exerciseId: string): string {
  const exercise = getModule(catalog).exercises.find((candidate) => candidate.id === exerciseId);
  if (!exercise) throw new Error(`exercise ${exerciseId} missing`);
  const option = exercise.options.find((candidate) => candidate.isCorrect);
  if (!option) throw new Error(`exercise ${exerciseId} has no correct option`);
  return option.id;
}

function incorrectOptionId(catalog: InMemoryExerciseCatalog, exerciseId: string): string {
  const exercise = getModule(catalog).exercises.find((candidate) => candidate.id === exerciseId);
  if (!exercise) throw new Error(`exercise ${exerciseId} missing`);
  const option = exercise.options.find((candidate) => !candidate.isCorrect);
  if (!option) throw new Error(`exercise ${exerciseId} has no incorrect option`);
  return option.id;
}

function currentExerciseId(view: AttemptView): string {
  if (!view.currentExercise) throw new Error("no current exercise");
  return view.currentExercise.id;
}

describe("AttemptEngine", () => {
  it("keeps hearts at 5 on a wrong practice answer", async () => {
    const { catalog, engine } = setup();
    const view = await engine.start(STUDENT_ID, { moduleId: MODULE_ID, mode: "practice" });
    const exerciseId = currentExerciseId(view);
    const result = await engine.answer(STUDENT_ID, view.attemptId, {
      exerciseId,
      selectedOptionId: incorrectOptionId(catalog, exerciseId)
    });
    expect(result.isCorrect).toBe(false);
    expect(result.attempt.heartsRemaining).toBe(5);
  });

  it("decrements hearts to 4 on a wrong final_quiz answer", async () => {
    const { catalog, engine } = setup();
    const view = await engine.start(STUDENT_ID, { moduleId: MODULE_ID, mode: "final_quiz" });
    const exerciseId = currentExerciseId(view);
    const result = await engine.answer(STUDENT_ID, view.attemptId, {
      exerciseId,
      selectedOptionId: incorrectOptionId(catalog, exerciseId)
    });
    expect(result.attempt.heartsRemaining).toBe(4);
  });

  it("fails the final_quiz attempt immediately when hearts reach 0", async () => {
    const { catalog, engine } = setup();
    let view = await engine.start(STUDENT_ID, { moduleId: MODULE_ID, mode: "final_quiz" });
    for (let i = 0; i < 5; i += 1) {
      const exerciseId = currentExerciseId(view);
      const result = await engine.answer(STUDENT_ID, view.attemptId, {
        exerciseId,
        selectedOptionId: incorrectOptionId(catalog, exerciseId)
      });
      view = result.attempt;
    }
    expect(view.heartsRemaining).toBe(0);
    expect(view.status).toBe("failed");
  });

  it("throws when answering an exercise that is not the current one", async () => {
    const { catalog, engine } = setup();
    const view = await engine.start(STUDENT_ID, { moduleId: MODULE_ID, mode: "practice" });
    const firstExerciseId = currentExerciseId(view);
    await engine.answer(STUDENT_ID, view.attemptId, {
      exerciseId: firstExerciseId,
      selectedOptionId: correctOptionId(catalog, firstExerciseId)
    });
    await expect(
      engine.answer(STUDENT_ID, view.attemptId, {
        exerciseId: firstExerciseId,
        selectedOptionId: correctOptionId(catalog, firstExerciseId)
      })
    ).rejects.toThrow(AttemptError);
    const exerciseIds = getModule(catalog).exercises.map((exercise) => exercise.id);
    await expect(
      engine.answer(STUDENT_ID, view.attemptId, {
        exerciseId: exerciseIds[4],
        selectedOptionId: correctOptionId(catalog, exerciseIds[4])
      })
    ).rejects.toThrow(AttemptError);
  });

  it("grants 10 XP for a correct answer only once across attempts", async () => {
    const { catalog, engine } = setup();
    const first = await engine.start(STUDENT_ID, { moduleId: MODULE_ID, mode: "practice" });
    const exerciseId = currentExerciseId(first);
    const firstResult = await engine.answer(STUDENT_ID, first.attemptId, {
      exerciseId,
      selectedOptionId: correctOptionId(catalog, exerciseId)
    });
    expect(firstResult.xpDelta).toBe(10);

    const second = await engine.start(STUDENT_ID, { moduleId: MODULE_ID, mode: "practice" });
    const secondResult = await engine.answer(STUDENT_ID, second.attemptId, {
      exerciseId,
      selectedOptionId: correctOptionId(catalog, exerciseId)
    });
    expect(secondResult.isCorrect).toBe(true);
    expect(secondResult.xpDelta).toBe(0);
  });

  it("passes an all-correct final quiz with 100 + 150 bonuses, granted only once", async () => {
    const { catalog, engine } = setup();
    const runQuiz = async () => {
      let view = await engine.start(STUDENT_ID, { moduleId: MODULE_ID, mode: "final_quiz" });
      for (let i = 0; i < 5; i += 1) {
        const exerciseId = currentExerciseId(view);
        const result = await engine.answer(STUDENT_ID, view.attemptId, {
          exerciseId,
          selectedOptionId: correctOptionId(catalog, exerciseId)
        });
        view = result.attempt;
      }
      return view;
    };

    const firstRun = await runQuiz();
    expect(firstRun.status).toBe("passed");
    expect(firstRun.xpEarned).toBe(5 * 10 + 100 + 150);

    const secondRun = await runQuiz();
    expect(secondRun.status).toBe("passed");
    expect(secondRun.xpEarned).toBe(0);
  });

  it("never exposes isCorrect on options in views", async () => {
    const { catalog, engine } = setup();
    const view = await engine.start(STUDENT_ID, { moduleId: MODULE_ID, mode: "practice" });
    for (const option of view.currentExercise?.options ?? []) {
      expect(option).not.toHaveProperty("isCorrect");
    }
    const exerciseId = currentExerciseId(view);
    const result = await engine.answer(STUDENT_ID, view.attemptId, {
      exerciseId,
      selectedOptionId: correctOptionId(catalog, exerciseId)
    });
    for (const option of result.attempt.currentExercise?.options ?? []) {
      expect(option).not.toHaveProperty("isCorrect");
    }
  });

  it("completes practice after all 5 answers with a one-time 50 XP bonus", async () => {
    const { catalog, engine } = setup();
    const runPractice = async () => {
      let view = await engine.start(STUDENT_ID, { moduleId: MODULE_ID, mode: "practice" });
      for (let i = 0; i < 5; i += 1) {
        const exerciseId = currentExerciseId(view);
        const result = await engine.answer(STUDENT_ID, view.attemptId, {
          exerciseId,
          selectedOptionId: correctOptionId(catalog, exerciseId)
        });
        view = result.attempt;
      }
      return view;
    };

    const firstRun = await runPractice();
    expect(firstRun.status).toBe("completed");
    expect(firstRun.xpEarned).toBe(5 * 10 + 50);

    const secondRun = await runPractice();
    expect(secondRun.status).toBe("completed");
    expect(secondRun.xpEarned).toBe(0);
  });

  it("continues an in-progress attempt after reloading it from the store", async () => {
    const { catalog, store, engine } = setup();
    const firstEngine = engine;
    const secondEngine = new AttemptEngine(store, catalog);
    const view = await firstEngine.start(STUDENT_ID, { moduleId: MODULE_ID, mode: "practice" });
    const firstExerciseId = currentExerciseId(view);
    const firstResult = await firstEngine.answer(STUDENT_ID, view.attemptId, {
      exerciseId: firstExerciseId,
      selectedOptionId: correctOptionId(catalog, firstExerciseId)
    });

    const secondExerciseId = currentExerciseId(firstResult.attempt);
    const secondResult = await secondEngine.answer(STUDENT_ID, view.attemptId, {
      exerciseId: secondExerciseId,
      selectedOptionId: correctOptionId(catalog, secondExerciseId)
    });

    expect(secondResult.attempt.answeredCount).toBe(2);
    expect(secondResult.attempt.xpEarned).toBe(20);
  });
});
