import type { ButtonHTMLAttributes, ReactNode } from "react";

export type PrimaryGlowButtonVariant = "default" | "success" | "danger";

export type PrimaryGlowButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Visual intent. `default` = cyan gradient + glow, `success` = green, `danger` = red. */
  variant?: PrimaryGlowButtonVariant;
  /** Shows a spinner and disables interaction. */
  loading?: boolean;
  children: ReactNode;
};

export function PrimaryGlowButton({
  variant = "default",
  loading = false,
  disabled,
  className,
  children,
  type = "button",
  ...rest
}: PrimaryGlowButtonProps) {
  const isDisabled = disabled || loading;
  const classes = [
    "gradient-button",
    "primary-glow-button",
    `primary-glow-button--${variant}`,
    loading ? "primary-glow-button--loading" : "",
    className
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      {...rest}
      type={type}
      className={classes}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      data-variant={variant}
    >
      {loading && <span className="primary-glow-button__spinner" aria-hidden="true" />}
      {children}
    </button>
  );
}
