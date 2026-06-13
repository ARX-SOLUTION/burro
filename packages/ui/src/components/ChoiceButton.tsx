export type ChoiceButtonState = "idle" | "selected" | "correct" | "wrong";

export type ChoiceButtonProps = {
  label: string;
  /** Visual state. Defaults to `idle`. */
  state?: ChoiceButtonState;
  disabled?: boolean;
  onClick?: () => void;
};

export function ChoiceButton({ label, state = "idle", disabled, onClick }: ChoiceButtonProps) {
  // `idle` adds no modifier so the base `.answer-option` styling applies.
  const stateClass = state === "idle" ? "" : state;
  const classes = ["answer-option", "choice-button", stateClass].filter(Boolean).join(" ");

  return (
    <button
      type="button"
      className={classes}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={state === "selected"}
      data-state={state}
    >
      {label}
    </button>
  );
}
