import path from "node:path";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { describe, expect, it } from "vitest";
import { DrizzleAttemptsStore } from "../modules/attempts/adapters/drizzle-attempts.store";
import { AttemptEngine } from "../modules/attempts/attempt-engine";
import type { ExerciseCatalogPort, ModuleContentRecord } from "../modules/attempts/attempts.ports";
import type { BurroDb } from "./client";
import * as schema from "./schema";
import { exerciseOptions, exercises, modules, studentActiveDays, studentXpTotals, users } from "./schema";

// Live check against a real PostgreSQL. Skipped unless a connection string is
// provided, so the default `pnpm test` run stays DB-free.
const TEST_DATABASE_URL = process.env.BURRO_DB_TEST_URL ?? process.env.DATABASE_URL;

// Throwing this inside a transaction rolls back every seeded row, keeping the
// target database untouched after the check passes. The store's applyAnswer
// opens its own transaction; nested inside this rollback transaction it runs
// as a savepoint, so atomicity and the final rollback both hold.
class Rollback extends Error {}

const CORRECT_ANSWER_XP = 10;

describe.skipIf(!TEST_DATABASE_URL)("attempts persistence (live PostgreSQL)", () => {
  it("saves, reloads, answers, and awards XP exactly once", async () => {
    const pool = new Pool({ connectionString: TEST_DATABASE_URL });
    const db = drizzle(pool, { schema });

    try {
      await migrate(db, { migrationsFolder: path.resolve(__dirname, "../../drizzle") });

      await db
        .transaction(async (tx) => {
          const store = new DrizzleAttemptsStore(tx as unknown as BurroDb);

          // Seed the foreign-key graph the attempts schema requires.
          const studentId = crypto.randomUUID();
          await tx.insert(users).values({
            id: studentId,
            telegramUserId: Math.floor(Math.random() * 1_000_000_000),
            telegramFirstName: "Persistence Check",
            role: "student"
          });

          const moduleId = crypto.randomUUID();
          await tx.insert(modules).values({ id: moduleId, sequenceNo: 1, slug: `check-${moduleId}` });

          const exerciseIds = [crypto.randomUUID(), crypto.randomUUID()];
          await tx.insert(exercises).values(exerciseIds.map((id) => ({ id, type: "find_letter" as const })));

          const correctOptionByExercise = new Map<string, string>();
          for (const exerciseId of exerciseIds) {
            const correctId = crypto.randomUUID();
            correctOptionByExercise.set(exerciseId, correctId);
            await tx.insert(exerciseOptions).values([
              { id: correctId, exerciseId, optionText: "correct", isCorrect: true, sortOrder: 0 },
              { id: crypto.randomUUID(), exerciseId, optionText: "wrong", isCorrect: false, sortOrder: 1 }
            ]);
          }

          const module: ModuleContentRecord = {
            id: moduleId,
            heartsCount: 5,
            passScore: 80,
            correctAnswerXp: CORRECT_ANSWER_XP,
            practiceCompletionXp: 50,
            finalQuizPassXp: 100,
            moduleCompletionXp: 150,
            feedback: {
              correctTitle: "ok",
              correctMessage: "ok",
              incorrectTitle: "no",
              incorrectMessage: "no"
            },
            exercises: exerciseIds.map((id) => ({
              id,
              prompt: "?",
              audioUrl: null,
              options: [
                { id: correctOptionByExercise.get(id)!, label: "correct", isCorrect: true },
                { id: crypto.randomUUID(), label: "wrong", isCorrect: false }
              ]
            }))
          };
          const catalog: ExerciseCatalogPort = { getModule: async () => module };
          const engine = new AttemptEngine(store, catalog);

          // 1. Save: starting an attempt persists it.
          const started = await engine.start(studentId, { moduleId, mode: "practice" });

          // 2. Reload: the persisted attempt round-trips from the store.
          const reloaded = await store.getAttempt(started.attemptId);
          expect(reloaded?.status).toBe("in_progress");
          expect(reloaded?.exerciseIds).toEqual(exerciseIds);
          expect(reloaded?.xpEarned).toBe(0);

          // 3. Answer: a correct answer is recorded and awards XP once.
          const firstExerciseId = started.currentExercise!.id;
          const result = await engine.answer(studentId, started.attemptId, {
            exerciseId: firstExerciseId,
            selectedOptionId: correctOptionByExercise.get(firstExerciseId)!,
            clientAnswerId: "persistence-check-first-answer"
          });
          expect(result.isCorrect).toBe(true);
          expect(result.xpDelta).toBe(CORRECT_ANSWER_XP);

          const afterAnswer = await store.getAttempt(started.attemptId);
          expect(afterAnswer?.answeredExerciseIds).toEqual([firstExerciseId]);
          expect(afterAnswer?.xpEarned).toBe(CORRECT_ANSWER_XP);

          const [activeDayAfterFirstAnswer] = await tx
            .select()
            .from(studentActiveDays)
            .where(eq(studentActiveDays.studentUserId, studentId));
          expect(activeDayAfterFirstAnswer?.answersCount).toBe(1);
          expect(activeDayAfterFirstAnswer?.isActiveDay).toBe(true);

          // 4. Awarded once: re-answering the same source in a new attempt grants 0.
          const second = await engine.start(studentId, { moduleId, mode: "practice" });
          const replay = await engine.answer(studentId, second.attemptId, {
            exerciseId: firstExerciseId,
            selectedOptionId: correctOptionByExercise.get(firstExerciseId)!,
            clientAnswerId: "persistence-check-replay-answer"
          });
          expect(replay.isCorrect).toBe(true);
          expect(replay.xpDelta).toBe(0);

          const [total] = await tx
            .select()
            .from(studentXpTotals)
            .where(eq(studentXpTotals.studentUserId, studentId));
          expect(total?.totalXp).toBe(CORRECT_ANSWER_XP);

          const [activeDayAfterSecondAnswer] = await tx
            .select()
            .from(studentActiveDays)
            .where(eq(studentActiveDays.studentUserId, studentId));
          expect(activeDayAfterSecondAnswer?.answersCount).toBe(2);

          throw new Rollback();
        })
        .catch((error) => {
          if (!(error instanceof Rollback)) {
            throw error;
          }
        });
    } finally {
      await pool.end();
    }
  });
});
