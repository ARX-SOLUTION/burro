export type AudioCircleButtonState = "idle" | "playing";

export type AudioCircleButtonProps = {
  state?: AudioCircleButtonState;
  disabled?: boolean;
  onClick?: () => void;
  /** Accessible label. Provided by the caller from the localization layer (doc 12 §12). */
  ariaLabel: string;
};

export function AudioCircleButton({ state = "idle", disabled, onClick, ariaLabel }: AudioCircleButtonProps) {
  const classes = [
    "audio",
    "audio-circle",
    `audio-circle--${state}`,
    disabled ? "audio-circle--disabled" : ""
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      className={classes}
      aria-label={ariaLabel}
      aria-pressed={state === "playing"}
      type="button"
      onClick={onClick}
      disabled={disabled}
      data-state={state}
    >
      <span className="audio__icon audio-circle__icon" aria-hidden="true" />
    </button>
  );
}
