export type LearningPathNodeStatus =
  | "completed"
  | "current"
  | "available"
  | "locked"
  | "premium_locked";

export type LearningPathNodeProps = {
  status: LearningPathNodeStatus;
  /** Arabic letter or symbol shown for current/available nodes (doc 12 §8.7). */
  icon?: string;
  /** Accessible label, from the localization layer. */
  ariaLabel: string;
  onClick?: () => void;
};

// Status-driven glyphs. Letter/symbol from `icon` is used for current/available.
const statusGlyphs: Record<LearningPathNodeStatus, string> = {
  completed: "✓",
  current: "",
  available: "",
  locked: "🔒",
  premium_locked: "🔒"
};

export function LearningPathNode({ status, icon, ariaLabel, onClick }: LearningPathNodeProps) {
  const isBlocked = status === "locked" || status === "premium_locked";
  const isDisabled = isBlocked || !onClick;
  const glyph = statusGlyphs[status] || icon || "";

  return (
    <button
      type="button"
      className={`module-node learning-path-node learning-path-node--${status} module-node--${status}`}
      disabled={isDisabled}
      aria-current={status === "current" ? "step" : undefined}
      aria-label={ariaLabel}
      onClick={isDisabled ? undefined : onClick}
      data-status={status}
    >
      <span className="module-node__icon learning-path-node__icon" aria-hidden="true">
        {glyph}
      </span>
    </button>
  );
}
