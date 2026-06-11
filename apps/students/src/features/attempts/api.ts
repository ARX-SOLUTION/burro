import type { AnswerAttemptRequest, AnswerResultView, AttemptView, StartAttemptRequest } from "@burro/shared";
import { api } from "../../lib/api";

export function startAttempt(req: StartAttemptRequest): Promise<AttemptView> {
  return api.post<AttemptView>("/student/attempts/start", req);
}

export function answerAttempt(attemptId: string, req: AnswerAttemptRequest): Promise<AnswerResultView> {
  return api.post<AnswerResultView>(`/student/attempts/${attemptId}/answer`, req);
}
