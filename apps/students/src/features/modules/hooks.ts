import { useQuery } from "@tanstack/react-query";
import type { ModuleCardDto, StudentPathResponse } from "@burro/shared";
import { api } from "../../lib/api";
import { fetchStudentModulesMock } from "./mock";

export const moduleQueryKeys = {
  all: ["student", "modules"] as const,
  path: ["student", "path"] as const
};

/**
 * Live path data. Falls back to the mock catalog if the API rejects or the
 * student has no path yet, so the modules screen stays usable in dev without
 * the backend seeded.
 */
async function fetchStudentPath(): Promise<ModuleCardDto[]> {
  try {
    const response = await api.get<StudentPathResponse>("/student/path");
    if (response?.modules?.length) {
      return response.modules;
    }
  } catch {
    // Local-only dev fallback. The mock data lets the UI render before the
    // backend has progress rows for the current student.
  }
  return fetchStudentModulesMock();
}

export function useStudentModules() {
  return useQuery({
    queryKey: moduleQueryKeys.path,
    queryFn: fetchStudentPath
  });
}
