import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { AnswerResultView, AttemptView, ExerciseView, LearningMode } from "@burro/shared";
import { AnswerOption, AudioButton, FeedbackPanel, GlassCard, GradientButton, HeartCounter, ProgressHeader } from "../../components";
import { answerAttempt, startAttempt } from "./api";

type PlayerState =
  | { phase: "starting" }
  | { phase: "playing"; attempt: AttemptView; selectedOptionId: string | null; error?: string }
  | { phase: "checking"; attempt: AttemptView; selectedOptionId: string }
  | { phase: "answered"; attempt: AttemptView; exercise: ExerciseView; result: AnswerResultView }
  | { phase: "finished"; attempt: AttemptView }
  | { phase: "failed-to-load"; message: string };

const finishedText: Record<string, string> = {
  passed: "Modul yakunlandi! 🎉",
  completed: "Mashq yakunlandi!",
  failed: "Urinish muvaffaqiyatsiz. Mashqni qayta ishlang."
};

export function ExercisePlayer({ moduleId, mode }: { moduleId: string; mode: LearningMode }) {
  const navigate = useNavigate();
  const [state, setState] = useState<PlayerState>({ phase: "starting" });

  const start = useCallback(() => {
    setState({ phase: "starting" });
    startAttempt({ moduleId, mode })
      .then((attempt) => setState({ phase: "playing", attempt, selectedOptionId: null }))
      .catch((error) => setState({ phase: "failed-to-load", message: error instanceof Error ? error.message : "Mashqni boshlab bo‘lmadi." }));
  }, [moduleId, mode]);

  useEffect(() => {
    start();
  }, [start]);

  const selectOption = (optionId: string) => {
    setState((current) => current.phase === "playing" ? { ...current, selectedOptionId: optionId, error: undefined } : current);
  };

  const handleCheck = async () => {
    if (state.phase !== "playing" || !state.selectedOptionId) {
      return;
    }
    const { attempt, selectedOptionId } = state;
    const exercise = attempt.currentExercise;
    if (!exercise) {
      return;
    }
    setState({ phase: "checking", attempt, selectedOptionId });
    try {
      const result = await answerAttempt(attempt.attemptId, { exerciseId: exercise.id, selectedOptionId });
      setState({ phase: "answered", attempt: result.attempt, exercise, result });
    } catch (error) {
      setState({ phase: "playing", attempt, selectedOptionId, error: error instanceof Error ? error.message : "Javobni tekshirib bo‘lmadi." });
    }
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

  return <>
    <ProgressHeader title={`Savol ${Math.min(attempt.answeredCount + 1, attempt.totalExercises)}`} progress={`${attempt.answeredCount}/${attempt.totalExercises}`} />
    <div className="top-row">{mode === "final_quiz" && <HeartCounter hearts={attempt.heartsRemaining} />}<span className="pill">{mode === "final_quiz" ? "Final Quiz" : "Practice"}</span></div>
    {exercise && <GlassCard>
      <h2>{exercise.prompt}</h2>
      {exercise.audioUrl != null && <AudioButton />}
      {exercise.options.map((option) => <AnswerOption key={option.id} label={option.label} state={optionState(option.id)} onClick={() => selectOption(option.id)} />)}
      {(state.phase === "playing" || state.phase === "checking") && <GradientButton disabled={state.phase !== "playing" || !state.selectedOptionId} onClick={handleCheck}>{state.phase === "checking" ? "Tekshirilmoqda..." : "Tekshirish"}</GradientButton>}
      {state.phase === "playing" && state.error && <FeedbackPanel type="wrong" text={state.error} />}
      {state.phase === "answered" && <FeedbackPanel type={state.result.isCorrect ? "correct" : "wrong"} text={state.result.isCorrect && state.result.xpDelta > 0 ? `${state.result.feedback.message}. +${state.result.xpDelta} XP` : state.result.feedback.message} />}
      {state.phase === "answered" && <GradientButton onClick={handleContinue}>Davom etish</GradientButton>}
    </GlassCard>}
  </>;
}
