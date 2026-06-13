import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { AnswerResultView, AttemptView, ExerciseView, LearningMode } from "@burro/shared";
import { AnswerOption, AudioButton, FeedbackPanel, GlassCard, GradientButton, HeartCounter, ProgressHeader } from "@burro/ui";
import { useAnswerAttempt, useStartAttempt } from "./hooks";

type PlayerState =
  | { phase: "starting" }
  | { phase: "playing"; attempt: AttemptView; selectedOptionId: string | null; error?: string }
  | { phase: "checking"; attempt: AttemptView; selectedOptionId: string }
  | { phase: "answered"; attempt: AttemptView; exercise: ExerciseView; result: AnswerResultView }
  | { phase: "finished"; attempt: AttemptView }
  | { phase: "failed-to-load"; message: string };

const finishedText: Record<string, string> = {
  passed: "Modul yakunlandi!",
  completed: "Mashq yakunlandi!",
  failed: "Urinish muvaffaqiyatsiz. Mashqni qayta ishlang."
};

export function ExercisePlayer({ moduleId, mode }: { moduleId: string; mode: LearningMode }) {
  const navigate = useNavigate();
  const [state, setState] = useState<PlayerState>({ phase: "starting" });
  const { mutate: mutateStart } = useStartAttempt();
  const { mutate: mutateAnswer } = useAnswerAttempt();

  const start = useCallback(() => {
    setState({ phase: "starting" });
    mutateStart({ moduleId, mode }, {
      onSuccess: (attempt) => setState({ phase: "playing", attempt, selectedOptionId: null }),
      onError: (error) => setState({ phase: "failed-to-load", message: error instanceof Error ? error.message : "Mashqni boshlab bo‘lmadi." })
    });
  }, [moduleId, mode, mutateStart]);

  useEffect(() => {
    start();
  }, [start]);

  const selectOption = (optionId: string) => {
    setState((current) => current.phase === "playing" ? { ...current, selectedOptionId: optionId, error: undefined } : current);
  };

  const handleCheck = () => {
    if (state.phase !== "playing" || !state.selectedOptionId) {
      return;
    }
    const { attempt, selectedOptionId } = state;
    const exercise = attempt.currentExercise;
    if (!exercise) {
      return;
    }
    const clientAnswerId = createClientAnswerId();
    setState({ phase: "checking", attempt, selectedOptionId });
    mutateAnswer({ attemptId: attempt.attemptId, exerciseId: exercise.id, selectedOptionId, clientAnswerId }, {
      onSuccess: (result) => setState({ phase: "answered", attempt: result.attempt, exercise, result }),
      onError: (error) => setState({ phase: "playing", attempt, selectedOptionId, error: error instanceof Error ? error.message : "Javobni tekshirib bo‘lmadi." })
    });
  };

  const handleContinue = () => {
    if (state.phase !== "answered") {
      return;
    }
    const { result } = state;
    if (result.attempt.status === "in_progress") {
      setState({ phase: "playing", attempt: result.attempt, selectedOptionId: null });
    } else {
      setState({ phase: "finished", attempt: result.attempt });
    }
  };

  const optionState = (optionId: string): "selected" | "correct" | "wrong" | undefined => {
    if (state.phase === "answered") {
      if (optionId === state.result.correctOptionId) {
        return "correct";
      }
      if (optionId === state.result.selectedOptionId && !state.result.isCorrect) {
        return "wrong";
      }
      return undefined;
    }
    if (state.phase === "playing" || state.phase === "checking") {
      return state.selectedOptionId === optionId ? "selected" : undefined;
    }
    return undefined;
  };

  if (state.phase === "starting") {
    return <GlassCard><p>Yuklanmoqda...</p></GlassCard>;
  }

  if (state.phase === "failed-to-load") {
    return <GlassCard><h2>Xatolik</h2><p>{state.message}</p><GradientButton onClick={start}>Qayta urinish</GradientButton></GlassCard>;
  }

  if (state.phase === "finished") {
    return <GlassCard>
      <h2>{finishedText[state.attempt.status] ?? finishedText.completed}</h2>
      <p>Jami: {state.attempt.xpEarned} XP</p>
      <GradientButton onClick={() => navigate({ to: "/modules/$moduleId", params: { moduleId } })}>Modulga qaytish</GradientButton>
    </GlassCard>;
  }

  const { attempt } = state;
  const exercise = state.phase === "answered" ? state.exercise : attempt.currentExercise;

  return (
    <section className="exercise-player">
      <ProgressHeader title={`Savol ${Math.min(attempt.answeredCount + 1, attempt.totalExercises)}`} progress={`${attempt.answeredCount}/${attempt.totalExercises}`} />
      <div className="exercise-meta-row">
        {mode === "final_quiz" ? <HeartCounter hearts={attempt.heartsRemaining} /> : <span className="exercise-mode">Practice</span>}
        <button className="round-icon round-icon--info" type="button" aria-label="Savol haqida ma'lumot" />
      </div>
      {exercise && (
        <>
          <GlassCard>
            <div className="exercise-card">
              <p className="exercise-card__eyebrow">Harfni tanlang</p>
              <strong className="exercise-glyph">{getExerciseGlyph(exercise.prompt)}</strong>
              <h2>{exercise.prompt}</h2>
              {exercise.audioUrl != null && <AudioButton />}
              <div className="answer-grid">
                {exercise.options.map((option) => (
                  <AnswerOption key={option.id} label={option.label} state={optionState(option.id)} onClick={() => selectOption(option.id)} />
                ))}
              </div>
            </div>
          </GlassCard>
          {state.phase === "playing" && state.error && <FeedbackPanel type="wrong" text={state.error} />}
          {state.phase === "answered" && (
            <FeedbackPanel
              type={state.result.isCorrect ? "correct" : "wrong"}
              text={state.result.isCorrect && state.result.xpDelta > 0 ? `${state.result.feedback.message}. +${state.result.xpDelta} XP` : state.result.feedback.message}
            />
          )}
          {(state.phase === "playing" || state.phase === "checking") && (
            <GradientButton disabled={state.phase !== "playing" || !state.selectedOptionId} onClick={handleCheck}>
              {state.phase === "checking" ? "Tekshirilmoqda..." : "Tekshirish"}
            </GradientButton>
          )}
          {state.phase === "answered" && <GradientButton onClick={handleContinue}>Davom etish</GradientButton>}
        </>
      )}
    </section>
  );
}

function createClientAnswerId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getExerciseGlyph(prompt: string): string {
  const normalized = prompt.toLowerCase();
  if (normalized.includes("ba")) {
    return "ب";
  }
  if (normalized.includes("ta")) {
    return "ت";
  }
  if (normalized.includes("sa") || normalized.includes("tha")) {
    return "ث";
  }
  if (normalized.includes("jim")) {
    return "ج";
  }
  return "ا";
}
