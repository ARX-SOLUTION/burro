import { Injectable } from "@nestjs/common";
import { and, asc, eq } from "drizzle-orm";
import type { BurroDb } from "../../../db/client";
import {
  exerciseOptions,
  exercises,
  exerciseTranslations,
  media,
  moduleExercises,
  moduleFeedback,
  modules
} from "../../../db/schema";
import { ExerciseCatalogPort, ExerciseRecord, ModuleContentRecord } from "../attempts.ports";

const DEFAULT_LANGUAGE = "uz" as const;

/**
 * Reads module content from PostgreSQL. Text comes from the per-language
 * translation tables (default uz, matching module_feedback); audio is resolved
 * through media. Exercises are ordered by module_exercises.sort_order so the
 * attempt engine walks them deterministically.
 */
@Injectable()
export class DrizzleExerciseCatalog implements ExerciseCatalogPort {
  constructor(private readonly database: BurroDb) {}

  async getModule(moduleId: string): Promise<ModuleContentRecord | undefined> {
    const [module] = await this.database.select().from(modules).where(eq(modules.id, moduleId)).limit(1);
    if (!module) {
      return undefined;
    }

    const [feedbackRow] = await this.database
      .select()
      .from(moduleFeedback)
      .where(and(eq(moduleFeedback.moduleId, moduleId), eq(moduleFeedback.language, DEFAULT_LANGUAGE)))
      .limit(1);

    const exerciseRows = await this.database
      .select({
        exerciseId: exercises.id,
        sortOrder: moduleExercises.sortOrder,
        prompt: exerciseTranslations.prompt,
        audioUrl: media.url
      })
      .from(moduleExercises)
      .innerJoin(exercises, eq(moduleExercises.exerciseId, exercises.id))
      .leftJoin(
        exerciseTranslations,
        and(eq(exerciseTranslations.exerciseId, exercises.id), eq(exerciseTranslations.language, DEFAULT_LANGUAGE))
      )
      .leftJoin(media, eq(exercises.mediaId, media.id))
      .where(eq(moduleExercises.moduleId, moduleId))
      .orderBy(asc(moduleExercises.sortOrder));

    const exerciseIds = exerciseRows.map((row) => row.exerciseId);
    const optionRows = exerciseIds.length
      ? await this.database
          .select()
          .from(exerciseOptions)
          .orderBy(asc(exerciseOptions.exerciseId), asc(exerciseOptions.sortOrder))
      : [];

    const optionsByExercise = new Map<string, ExerciseRecord["options"]>();
    for (const option of optionRows) {
      if (!exerciseIds.includes(option.exerciseId)) {
        continue;
      }
      const list = optionsByExercise.get(option.exerciseId) ?? [];
      list.push({ id: option.id, label: option.optionText, isCorrect: option.isCorrect });
      optionsByExercise.set(option.exerciseId, list);
    }

    const exerciseRecords: ExerciseRecord[] = exerciseRows.map((row) => ({
      id: row.exerciseId,
      prompt: row.prompt ?? "",
      audioUrl: row.audioUrl ?? null,
      options: optionsByExercise.get(row.exerciseId) ?? []
    }));

    return {
      id: module.id,
      heartsCount: module.heartsCount,
      passScore: module.passScore,
      correctAnswerXp: module.correctAnswerXp,
      practiceCompletionXp: module.practiceCompletionXp,
      finalQuizPassXp: module.finalQuizPassXp,
      moduleCompletionXp: module.moduleCompletionXp,
      exercises: exerciseRecords,
      feedback: {
        correctTitle: feedbackRow?.correctTitle ?? "",
        correctMessage: feedbackRow?.correctMessage ?? "",
        incorrectTitle: feedbackRow?.incorrectTitle ?? "",
        incorrectMessage: feedbackRow?.incorrectMessage ?? ""
      }
    };
  }
}
