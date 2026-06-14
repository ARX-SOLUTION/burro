import { useQuery } from "@tanstack/react-query";
import type { ModuleCardDto } from "@burro/shared";
import { fetchModuleExercises, fetchModuleResult, fetchStudentPath } from "./api";

export const learningQueryKeys = {
  moduleResult: (moduleId: string) => ["student", "module-result", moduleId] as const,
  path: ["student", "path"] as const,
  moduleExercises: (moduleId: string) => ["student", "module-exercises", moduleId] as const
};

/** GET /student/modules/:moduleId/result — XP, accuracy, passed flag for the completion screen. */
export function useModuleResult(moduleId: string) {
  return useQuery({
    queryKey: learningQueryKeys.moduleResult(moduleId),
    queryFn: () => fetchModuleResult(moduleId),
    enabled: Boolean(moduleId)
  });
}

/** Finds the next module after `currentModuleId` on the student's path; null when at the end. */
export function useNextModule(currentModuleId: string) {
  return useQuery({
    queryKey: [...learningQueryKeys.path, "next", currentModuleId] as const,
    queryFn: async (): Promise<ModuleCardDto | null> => {
      const response = await fetchStudentPath();
      const modules = response.modules ?? [];
      const sorted = [...modules].sort((a, b) => a.sequenceNo - b.sequenceNo);
      const currentIndex = sorted.findIndex((m) => m.id === currentModuleId);
      if (currentIndex < 0) {
        return null;
      }
      return sorted[currentIndex + 1] ?? null;
    },
    enabled: Boolean(currentModuleId)
  });
}

/** Practice/quiz exercises for a module. Used by SoundInfo to source a placeholder audio URL. */
export function useModuleExercises(moduleId: string) {
  return useQuery({
    queryKey: learningQueryKeys.moduleExercises(moduleId),
    queryFn: () => fetchModuleExercises(moduleId),
    enabled: Boolean(moduleId)
  });
}
