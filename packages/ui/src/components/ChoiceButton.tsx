export type ChoiceButtonState = "idle" | "selected" | "correct" | "wrong";

export type ChoiceButtonProps = {
  label: string;
  /** Visual state. Defaults to `idle`. */
  state?: ChoiceButtonState;
  disabled?: boolean;
  onClick?: () => void;
};

const STATE_ICON: Record<Exclude<ChoiceButtonState, "idle" | "selected">, string> = {
  correct: "\u2713",
  wrong: "\u00D7"
};

export function ChoiceButton({ label, state = "idle", disabled, onClick }: ChoiceButtonProps) {
  // `idle` adds no modifier so the base `.answer-option` styling applies.
  const stateClass = state === "idle" ? "" : state;
  const classes = ["answer-option", "choice-button", stateClass].filter(Boolean).join(" ");
  const showIcon = state === "correct" || state === "wrong";

  return (
    <button
      type="button"
      className={classes}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={state === "selected"}
      data-state={state}
    >
      <span className="choice-button__label">{label}</span>
      {showIcon && (
        <span className="choice-button__icon" aria-hidden="true">
          {STATE_ICON[state]}
        </span>
      )}
    </button>
  );
}
