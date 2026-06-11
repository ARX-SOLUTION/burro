import { useMutation } from "@tanstack/react-query";
import type { AnswerAttemptRequest, AnswerResultView, AttemptView, StartAttemptRequest } from "@burro/shared";
import { answerAttempt, startAttempt } from "./api";

export function useStartAttempt() {
  return useMutation<AttemptView, Error, StartAttemptRequest>({
    mutationFn: (req) => startAttempt(req)
  });
}

export interface AnswerAttemptVariables extends AnswerAttemptRequest {
  attemptId: string;
}

export function useAnswerAttempt() {
  return useMutation<AnswerResultView, Error, AnswerAttemptVariables>({
    mutationFn: ({ attemptId, ...req }) => answerAttempt(attemptId, req)
  });
}
