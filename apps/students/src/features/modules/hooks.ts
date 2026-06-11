import { useQuery } from "@tanstack/react-query";
import { fetchStudentModulesMock } from "./mock";

export const moduleQueryKeys = {
  all: ["student", "modules"] as const
};

export function useStudentModules() {
  return useQuery({
    queryKey: moduleQueryKeys.all,
    queryFn: fetchStudentModulesMock
  });
}
