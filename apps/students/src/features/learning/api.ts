// Learning-flow API surface used by the module-completed and sound-info screens.
// `/student/modules/:moduleId/result` and `/student/path` already exist on the
// backend (apps/backend/src/modules/learning/learning.controller.ts).

import type { ModuleExercisesResponse, ModuleResultDto, StudentPathResponse } from "@burro/shared";
import { api } from "../../lib/api";

export function fetchModuleResult(moduleId: string): Promise<ModuleResultDto> {
  return api.get<ModuleResultDto>(`/student/modules/${moduleId}/result`);
}

export function fetchStudentPath(): Promise<StudentPathResponse> {
  return api.get<StudentPathResponse>("/student/path");
}

export function fetchModuleExercises(moduleId: string): Promise<ModuleExercisesResponse> {
  return api.get<ModuleExercisesResponse>(`/student/modules/${moduleId}/exercises`);
}
