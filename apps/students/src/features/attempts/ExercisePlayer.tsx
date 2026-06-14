import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { AnswerResultView, AttemptView, ExerciseView, LearningMode } from "@burro/shared";
import {
  AppBackground,
  AudioCircleButton,
  ChoiceButton,
  PrimaryGlowButton,
  QuizShell
} from "@burro/ui";
import type { ChoiceButtonState } from "@burro/ui";
import { useAnswerAttempt, useStartAttempt } from "./hooks";
import "./ExercisePlayer.css";

/**
 * State machine (doc 12 §10):
 *   LoadingQuestion → Idle → OptionSelected → Submitting
 *     → CorrectFeedback | WrongFeedback → NextQuestion → Idle
 *     → ModuleCompleted | Failed
 *
 * `clientAnswerId` is generated once per question and held until the
 * next question loads, so retries of the same Tekshirish call hit the
 * backend's idempotency key (doc 13 §5) and never grant XP twice.
 */
type PlayerState =
  | { phase: "starting" }
  | {
      phase: "playing";
      attempt: AttemptView;
      selectedOptionId: string | null;
      clientAnswerId: string;
      error?: string;
    }
  | {
      phase: "checking";
      attempt: AttemptView;
      selectedOptionId: string;
      clientAnswerId: string;
    }
  | {
      phase: "answered";
      attempt: AttemptView;
      exercise: ExerciseView;
      result: AnswerResultView;
    }
  | { phase: "finished"; attempt: AttemptView }
  | { phase: "failed-to-load"; message: string };

// User-facing strings. The student app is currently Uzbek-only on this
// surface; if/when localization is wired through, swap these for the i18n
// layer (doc 12 §12 — never hardcoded text outside the localization layer).
const TEXT = {
  loading: "Yuklanmoqda...",
  errorTitle: "Xatolik",
  retry: "Qayta urinish",
  checking: "Tekshirilmoqda...",
  check: "Tekshirish",
  continue: "Davom etish",
  close: "Yopish",
  info: "Savol haqida ma'lumot",
  audio: "Tovushni eshitish",
  promptLetter: "Qaysi tovush to'g'ri keladi?",
  promptListen: "Ushbu tovushni toping",
  finishedPassed: "Modul yakunlandi!",
  finishedCompleted: "Mashq yakunlandi!",
  finishedFailed: "Mashqni qayta ishlang. Yana urinib ko'ring.",
  totalXp: (xp: number) => `Jami: ${xp} XP`,
  backToModule: "Modulga qaytish"
};

export function ExercisePlayer({ moduleId, mode }: { moduleId: string; mode: LearningMode }) {
  const navigate = useNavigate();
  const [state, setState] = useState<PlayerState>({ phase: "starting" });
  const { mutate: mutateStart } = useStartAttempt();
  const { mutate: mutateAnswer } = useAnswerAttempt();

  // Single shared <audio> element. Doc 13 §10: only one audio plays at a time.
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioState, setAudioState] = useState<"idle" | "playing">("idle");

  // ---- Lifecycle: start attempt on mount and on explicit retry ----
  const start = useCallback(() => {
    setState({ phase: "starting" });
    mutateStart(
      { moduleId, mode },
      {
        onSuccess: (attempt) =>
          setState({
            phase: "playing",
            attempt,
            selectedOptionId: null,
            clientAnswerId: createClientAnswerId()
          }),
        onError: (error) =>
          setState({
            phase: "failed-to-load",
            message: error instanceof Error ? error.message : "Mashqni boshlab bo'lmadi."
          })
      }
    );
  }, [moduleId, mode, mutateStart]);

  useEffect(() => {
    start();
  }, [start]);

  // ---- Audio: stop on question change / unmount ----
  const currentExercise = state.phase === "answered" ? state.exercise : state.phase === "playing" || state.phase === "checking" ? state.attempt.currentExercise : null;
  const currentAudioUrl = currentExercise?.audioUrl ?? null;
  const exerciseId = currentExercise?.id;

  useEffect(() => {
    // Reset audio when the question changes.
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setAudioState("idle");
    return () => {
      const a = audioRef.current;
      if (a) {
        a.pause();
      }
    };
  }, [exerciseId]);

  const toggleAudio = useCallback(() => {
    if (!currentAudioUrl) {
      return;
    }
    // Lazily create the audio element so SSR-safe and re-use across replays.
    let audio = audioRef.current;
    if (!audio) {
      audio = new Audio(currentAudioUrl);
      audio.preload = "auto";
      audio.addEventListener("ended", () => setAudioState("idle"));
      audio.addEventListener("pause", () => setAudioState("idle"));
      audioRef.current = audio;
    } else if (audio.src !== currentAudioUrl) {
      audio.src = currentAudioUrl;
    }
    if (audioState === "playing") {
      audio.pause();
      audio.currentTime = 0;
      setAudioState("idle");
      return;
    }
    void audio
      .play()
      .then(() => setAudioState("playing"))
      .catch(() => setAudioState("idle"));
  }, [audioState, currentAudioUrl]);

  // ---- User actions ----
  const selectOption = (optionId: string) => {
    setState((current) =>
      current.phase === "playing"
        ? { ...current, selectedOptionId: optionId, error: undefined }
        : current
    );
  };

  const handleCheck = () => {
    if (state.phase !== "playing" || !state.selectedOptionId) {
      return;
    }
    const { attempt, selectedOptionId, clientAnswerId } = state;
    const exercise = attempt.currentExercise;
    if (!exercise) {
      return;
    }
    setState({ phase: "checking", attempt, selectedOptionId, clientAnswerId });
    mutateAnswer(
      { attemptId: attempt.attemptId, exerciseId: exercise.id, selectedOptionId, clientAnswerId },
      {
        onSuccess: (result) =>
          setState({ phase: "answered", attempt: result.attempt, exercise, result }),
        // On error we drop back to `playing` keeping the same clientAnswerId
        // so that a retry replays the same idempotency key and the backend
        // returns the original result.
        onError: (error) =>
          setState({
            phase: "playing",
            attempt,
            selectedOptionId,
            clientAnswerId,
            error: error instanceof Error ? error.message : "Javobni tekshirib bo'lmadi."
          })
      }
    );
  };

  const handleContinue = () => {
    if (state.phase !== "answered") {
      return;
    }
    const { result } = state;
    if (result.attempt.status === "in_progress") {
      setState({
        phase: "playing",
        attempt: result.attempt,
        selectedOptionId: null,
        clientAnswerId: createClientAnswerId()
      });
    } else {
      // ModuleCompleted / Failed → leave the player.
      setState({ phase: "finished", attempt: result.attempt });
    }
  };

  // When the attempt completes, navigate out to the completion screen
  // (router target /modules/$moduleId/completed; doc 12 §11). Failed
  // final_quiz attempts go back to the module path so the student can retry.
  useEffect(() => {
    if (state.phase !== "finished") {
      return;
    }
    const { status } = state.attempt;
    if (status === "passed" || status === "completed") {
      navigate({ to: "/modules/$moduleId/completed", params: { moduleId } });
    } else if (status === "failed") {
      navigate({ to: "/modules/$moduleId", params: { moduleId } });
    }
  }, [state, moduleId, navigate]);

  const handleClose = () => {
    navigate({ to: "/modules/$moduleId", params: { moduleId } });
  };

  // ---- Derived UI state ----
  const optionState = (optionId: string): ChoiceButtonState => {
    if (state.phase === "answered") {
      if (optionId === state.result.correctOptionId) {
        return "correct";
      }
      if (optionId === state.result.selectedOptionId && !state.result.isCorrect) {
        return "wrong";
      }
      return "idle";
    }
    if (state.phase === "playing" || state.phase === "checking") {
      return state.selectedOptionId === optionId ? "selected" : "idle";
    }
    return "idle";
  };

  // ---- Early returns ----
  if (state.phase === "starting") {
    return (
      <ExerciseScaffold>
        <section className="exercise-screen exercise-screen--state" aria-busy="true">
          <p className="exercise-screen__state">{TEXT.loading}</p>
        </section>
      </ExerciseScaffold>
    );
  }

  if (state.phase === "failed-to-load") {
    return (
      <ExerciseScaffold>
        <section className="exercise-screen exercise-screen--state" role="alert">
          <h2 className="exercise-screen__state-title">{TEXT.errorTitle}</h2>
          <p className="exercise-screen__state">{state.message}</p>
          <PrimaryGlowButton onClick={start}>{TEXT.retry}</PrimaryGlowButton>
        </section>
      </ExerciseScaffold>
    );
  }

  if (state.phase === "finished") {
    const title =
      state.attempt.status === "passed" || state.attempt.status === "completed"
        ? TEXT.finishedPassed
        : state.attempt.status === "failed"
          ? TEXT.finishedFailed
          : TEXT.finishedCompleted;
    return (
      <ExerciseScaffold>
        <section className="exercise-screen exercise-screen--state" role="status">
          <h2 className="exercise-screen__state-title">{title}</h2>
          <p className="exercise-screen__state">{TEXT.totalXp(state.attempt.xpEarned)}</p>
          <PrimaryGlowButton
            variant={state.attempt.status === "failed" ? "danger" : "success"}
            onClick={() => navigate({ to: "/modules/$moduleId", params: { moduleId } })}
          >
            {TEXT.backToModule}
          </PrimaryGlowButton>
        </section>
      </ExerciseScaffold>
    );
  }

  if (state.phase === "answered") {
    return <ExerciseFeedbackScreen result={state.result} onContinue={handleContinue} />;
  }

  // ---- Active question ----
  const { attempt } = state;
  const exercise = attempt.currentExercise;
  if (!exercise) {
    return (
      <ExerciseScaffold>
        <section className="exercise-screen exercise-screen--state">
          <p className="exercise-screen__state">{TEXT.loading}</p>
        </section>
      </ExerciseScaffold>
    );
  }

  const isListen = exercise.audioUrl != null;
  const isChecking = state.phase === "checking";
  const canCheck = state.phase === "playing" && Boolean(state.selectedOptionId);

  // Progress: completed answers / total (clamped 0-100).
  const progressPercent = attempt.totalExercises > 0
    ? Math.round((attempt.answeredCount / attempt.totalExercises) * 100)
    : 0;

  // XP preview shown in the top bar while answering. Answer result has its own
  // full-screen feedback state (ref 15), so the top bar is gone after submit.
  const xpPreview = attempt.xpEarned;

  // Hearts are only meaningful for final_quiz (doc 12 §9.6 hearts requirement).
  const heartsPreview = mode === "final_quiz" ? Math.max(0, attempt.heartsRemaining) : undefined;

  // Prompt: always backend-provided exercise.prompt (it's localized server-side
  // per the user's language). The two TEXT fallbacks below only kick in when
  // the backend returns an empty string — they keep the UI usable but should
  // not be relied upon in production.
  const promptText = exercise.prompt || (isListen ? TEXT.promptListen : TEXT.promptLetter);

  // Footer CTA: changes label, variant, disabled state by phase.
  const footer = (
    <>
      {state.phase === "playing" && state.error && (
        <div className="exercise-screen__inline-error" role="alert">
          {state.error}
        </div>
      )}
      <PrimaryGlowButton
        disabled={!canCheck}
        loading={isChecking}
        onClick={handleCheck}
      >
        {isChecking ? TEXT.checking : TEXT.check}
      </PrimaryGlowButton>
    </>
  );

  return (
    <ExerciseScaffold>
      <QuizShell
        progressPercent={progressPercent}
        hearts={heartsPreview}
        xpPreview={xpPreview}
        onClose={handleClose}
        closeLabel={TEXT.close}
        footer={footer}
      >
        <article className="exercise-card-figma" data-mode={mode} data-listen={isListen ? "true" : "false"}>
          <h2 className="exercise-card-figma__prompt">{promptText}</h2>
          {isListen ? (
            <div className="exercise-card-figma__media exercise-card-figma__media--audio">
              <AudioCircleButton
                state={audioState}
                onClick={toggleAudio}
                ariaLabel={TEXT.audio}
              />
            </div>
          ) : (
            <div className="exercise-card-figma__media exercise-card-figma__media--glyph">
              <span
                className="exercise-card-figma__glyph burro-arabic"
                aria-hidden="true"
              >
                {pickGlyph(exercise)}
              </span>
            </div>
          )}
        </article>

        <button
          type="button"
          className="exercise-info-button"
          aria-label={TEXT.info}
        >
          <span className="exercise-info-button__mark" aria-hidden="true">i</span>
        </button>

        <div className="exercise-options-grid">
          {exercise.options.map((option) => (
            <ChoiceButton
              key={option.id}
              label={option.label}
              state={optionState(option.id)}
              disabled={isChecking}
              onClick={() => selectOption(option.id)}
            />
          ))}
        </div>
      </QuizShell>
    </ExerciseScaffold>
  );
}

function ExerciseFeedbackScreen({
  result,
  onContinue
}: {
  result: AnswerResultView;
  onContinue: () => void;
}) {
  const tone = result.isCorrect ? "correct" : "wrong";
  const icon = result.isCorrect ? "✓" : "×";

  return (
    <section className={`exercise-feedback-screen exercise-feedback-screen--${tone}`} role="status">
      <div className="exercise-feedback-card">
        <div className="exercise-feedback-card__center">
          <div className="exercise-feedback-check" aria-hidden="true">
            <span>{icon}</span>
          </div>
          <h2 className="exercise-feedback-title">{result.feedback.title}</h2>
        </div>
      </div>
      <PrimaryGlowButton className="exercise-feedback-continue" onClick={onContinue}>
        {TEXT.continue}
      </PrimaryGlowButton>
    </section>
  );
}

/**
 * Full-bleed mosque background for the exercise screen. Breaks out of the
 * default .phone padding the same way Welcome/Login/Stats do, so the
 * background reaches the safe-area edges of the 402x874 canvas.
 */
function ExerciseScaffold({ children }: { children: React.ReactNode }) {
  return (
    <div className="exercise-screen-shell">
      <AppBackground variant="app" overlay="heavy">
        <div className="exercise-screen-content">{children}</div>
      </AppBackground>
    </div>
  );
}

function createClientAnswerId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Best-effort Arabic glyph for a "letter" exercise.
 *
 * The current `ExerciseView` doesn't carry the target letter as a field,
 * so we map from the prompt/option labels. Letter exercises in the seeded
 * content use transliterated option labels (Jeem/Ba/Ta/…); we pick the
 * glyph that matches the *correct* option when possible (the prompt alone
 * isn't always discriminative). Falls back to alif.
 */
const TRANSLIT_TO_GLYPH: Array<[RegExp, string]> = [
  [/^alif|^alef|^a$/i, "ا"],
  [/^ba$/i, "ب"],
  [/^ta$/i, "ت"],
  [/^tha|^sa$/i, "ث"],
  [/^jee?m|^jim|^ja$/i, "ج"],
  [/^h(?:a|aa)$/i, "ح"],
  [/^kha$/i, "خ"],
  [/^dal$/i, "د"],
  [/^dh(?:al|aal)$/i, "ذ"],
  [/^ra$/i, "ر"],
  [/^zay|^za$/i, "ز"],
  [/^sin$/i, "س"],
  [/^shin$/i, "ش"]
];

function transliterationToGlyph(text: string | undefined | null): string | null {
  if (!text) {
    return null;
  }
  const normalized = text.trim();
  for (const [pattern, glyph] of TRANSLIT_TO_GLYPH) {
    if (pattern.test(normalized)) {
      return glyph;
    }
  }
  return null;
}

function pickGlyph(exercise: ExerciseView): string {
  // Prefer any non-ASCII glyph already present in the prompt.
  const fromPrompt = exercise.prompt.match(/[؀-ۿ]/);
  if (fromPrompt) {
    return fromPrompt[0];
  }
  // Try mapping from option labels.
  for (const option of exercise.options) {
    const direct = option.label.match(/[؀-ۿ]/);
    if (direct) {
      return direct[0];
    }
    const mapped = transliterationToGlyph(option.label);
    if (mapped) {
      return mapped;
    }
  }
  // Fall back to mapping from the prompt.
  const mappedPrompt = transliterationToGlyph(exercise.prompt);
  if (mappedPrompt) {
    return mappedPrompt;
  }
  return "ا";
}
