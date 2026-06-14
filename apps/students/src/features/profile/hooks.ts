import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@burro/shared";
import type { PreferredLanguage, StudentProfileDto, UpdateProfileRequest } from "@burro/shared";
import { api } from "../../lib/api";

export function useProfile() {
  return useQuery<StudentProfileDto>({
    queryKey: queryKeys.profile.all,
    queryFn: () => api.get<StudentProfileDto>("/student/profile")
  });
}

/**
 * Patches the student's preferred language and refreshes the profile cache so
 * the row in `/profile` reflects the new value immediately (doc 12 §9.13).
 */
export function useUpdateProfileLanguage() {
  const qc = useQueryClient();
  return useMutation<StudentProfileDto, Error, PreferredLanguage>({
    mutationFn: (preferredLanguage) =>
      api.patch<StudentProfileDto>("/student/profile", { preferredLanguage } satisfies UpdateProfileRequest),
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.profile.all, data);
    }
  });
}
