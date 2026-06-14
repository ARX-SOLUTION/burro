import { Injectable } from "@nestjs/common";
import { and, asc, eq, inArray } from "drizzle-orm";
import type { BurroDb } from "../../../db/client";
import {
  exerciseOptions,
  exercises,
  exerciseTranslations,
  media,
  moduleExercises,
  moduleFeedback,
  modules,
  users
} from "../../../db/schema";
import {
  CatalogLanguage,
  CatalogLookupOptions,
  ExerciseCatalogPort,
  ExerciseRecord,
  ModuleContentRecord
} from "../attempts.ports";

const DEFAULT_LANGUAGE: CatalogLanguage = "uz";
const SUPPORTED_LANGUAGES = new Set<CatalogLanguage>(["uz", "ru", "en"]);

/**
 * Maps a raw user.preferredLanguage value (any string from the DB) to a
 * supported CatalogLanguage. Unknown / null / empty values fall back to uz.
 * Exported for unit testing — does not depend on the database.
 */
export function coerceLanguage(value: string | null | undefined): CatalogLanguage {
  if (value && SUPPORTED_LANGUAGES.has(value as CatalogLanguage)) {
    return value as CatalogLanguage;
  }
  return DEFAULT_LANGUAGE;
}

/**
 * Reads module content from PostgreSQL. Text comes from the per-language
 * translation tables (default uz, matching module_feedback); audio is resolved
 * through media. Exercises are ordered by module_exercises.sort_order so the
 * attempt engine walks them deterministically.
 */
@Injectable()
export class DrizzleExerciseCatalog implements ExerciseCatalogPort {
  constructor(private readonly database: BurroDb) {}

  async getModule(moduleId: string, options?: CatalogLookupOptions): Promise<ModuleContentRecord | undefined> {
    const [module] = await this.database.select().from(modules).where(eq(modules.id, moduleId)).limit(1);
    if (!module) {
      return undefined;
    }

    const language: CatalogLanguage = options?.language ?? (await this.resolveLanguage(options?.studentId));

    const [feedbackRow] = await this.database
      .select()
      .from(moduleFeedback)
      .where(and(eq(moduleFeedback.moduleId, moduleId), eq(moduleFeedback.language, language)))
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
        and(eq(exerciseTranslations.exerciseId, exercises.id), eq(exerciseTranslations.language, language))
      )
      .leftJoin(media, eq(exercises.mediaId, media.id))
      .where(eq(moduleExercises.moduleId, moduleId))
      .orderBy(asc(moduleExercises.sortOrder));

    const exerciseIds = exerciseRows.map((row) => row.exerciseId);
    const optionRows = exerciseIds.length
      ? await this.database
          .select()
          .from(exerciseOptions)
          .where(inArray(exerciseOptions.exerciseId, exerciseIds))
          .orderBy(asc(exerciseOptions.exerciseId), asc(exerciseOptions.sortOrder))
      : [];

    const optionsByExercise = new Map<string, ExerciseRecord["options"]>();
    for (const option of optionRows) {
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

  private async resolveLanguage(studentId?: string): Promise<CatalogLanguage> {
    if (!studentId) {
      return DEFAULT_LANGUAGE;
    }
    const [row] = await this.database
      .select({ language: users.preferredLanguage })
      .from(users)
      .where(eq(users.id, studentId))
      .limit(1);
    return coerceLanguage(row?.language);
  }
}
