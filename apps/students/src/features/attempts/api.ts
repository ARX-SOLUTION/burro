import type { AnswerAttemptRequest, AnswerResultView, AttemptView, StartAttemptRequest } from "@burro/shared";
import { apiPost } from "../../lib/api";

export function startAttempt(req: StartAttemptRequest): Promise<AttemptView> {
  return apiPost<AttemptView>("/student/attempts/start", req);
}

export function answerAttempt(attemptId: string, req: AnswerAttemptRequest): Promise<AnswerResultView> {
  return apiPost<AnswerResultView>(`/student/attempts/${attemptId}/answer`, req);
}
