import type { ReactNode } from "react";

export type QuizShellProps = {
  /** Progress bar fill, 0-100. */
  progressPercent: number;
  /** Remaining hearts (final quiz). Omit to hide the hearts pill. */
  hearts?: number;
  /** XP preview shown in the top bar. Omit to hide. */
  xpPreview?: number;
  /** Close handler for the top-left X. Omit to hide the button. */
  onClose?: () => void;
  /** Accessible label for the close button, from the localization layer. */
  closeLabel?: string;
  /** Question area. */
  children: ReactNode;
  /** Bottom CTA (e.g. PrimaryGlowButton). */
  footer: ReactNode;
};

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function QuizShell({
  progressPercent,
  hearts,
  xpPreview,
  onClose,
  closeLabel,
  children,
  footer
}: QuizShellProps) {
  const progress = clamp(progressPercent);

  return (
    <section className="quiz-shell">
      <header className="quiz-shell__bar">
        {onClose && (
          <button
            type="button"
            className="quiz-shell__close"
            onClick={onClose}
            aria-label={closeLabel}
          >
            <span aria-hidden="true">×</span>
          </button>
        )}
        <div
          className="quiz-shell__progress"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <span className="quiz-shell__progress-fill" style={{ width: `${progress}%` }} />
        </div>
        {typeof hearts === "number" && (
          <span className="quiz-shell__hearts" aria-label={`hearts:${hearts}`}>
            <span className="heart-counter__dot" aria-hidden="true" />
            {hearts}
          </span>
        )}
        {typeof xpPreview === "number" && (
          <span className="quiz-shell__xp">+{xpPreview} XP</span>
        )}
      </header>

      <div className="quiz-shell__question">{children}</div>

      <footer className="quiz-shell__footer">{footer}</footer>
    </section>
  );
}
