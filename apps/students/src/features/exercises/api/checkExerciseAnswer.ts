export type ExerciseMode = "practice" | "final_quiz";

export interface CheckExerciseAnswerRequest {
  selectedOptionId: string;
  mode: ExerciseMode;
}

export interface CheckExerciseAnswerResponse {
  exerciseId: string;
  selectedOptionId: string;
  correctOptionId: string;
  isCorrect: boolean;
  xpDelta: number;
  heartsRemaining: number;
  feedback: {
    title: string;
    message: string;
  };
}

const fallbackCorrectOptionId = "option-ba";

function shouldUseMockApi() {
  return import.meta.env.VITE_USE_MOCK_API === "true";
}

function getApiUrl() {
  return (import.meta.env.VITE_API_URL ?? "http://localhost:4000").replace(/\/$/, "");
}

function mockCheckExerciseAnswer(
  exerciseId: string,
  request: CheckExerciseAnswerRequest
): CheckExerciseAnswerResponse {
  const isCorrect = request.selectedOptionId === fallbackCorrectOptionId;

  return {
    exerciseId,
    selectedOptionId: request.selectedOptionId,
    correctOptionId: fallbackCorrectOptionId,
    isCorrect,
    xpDelta: isCorrect ? 10 : 0,
    heartsRemaining: request.mode === "final_quiz" && !isCorrect ? 2 : 3,
    feedback: isCorrect
      ? { title: "Ajoyib!", message: "To‘g‘ri javob" }
      : { title: "Yana urinib ko‘ramiz", message: request.mode === "practice" ? "Practice mode hearts kamaytirmaydi" : "Noto‘g‘ri javob" }
  };
}

export async function checkExerciseAnswer(
  exerciseId: string,
  request: CheckExerciseAnswerRequest
): Promise<CheckExerciseAnswerResponse> {
  if (shouldUseMockApi()) {
    return mockCheckExerciseAnswer(exerciseId, request);
  }

  const response = await fetch(`${getApiUrl()}/student/exercises/${exerciseId}/check`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    throw new Error(`Exercise check failed with status ${response.status}`);
  }

  const payload = await response.json() as CheckExerciseAnswerResponse | { data?: CheckExerciseAnswerResponse };

  if ("data" in payload && payload.data) {
    return payload.data;
  }

  return payload as CheckExerciseAnswerResponse;
}
