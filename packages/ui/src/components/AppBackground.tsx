import type { ReactNode } from "react";

export type AppBackgroundOverlay = "default" | "heavy" | "light";

export type AppBackgroundProps = {
  children: ReactNode;
  /** Strength of the dark readability overlay over the illustrated background. */
  overlay?: AppBackgroundOverlay;
  /** When true (default) the content area scrolls above the fixed background. */
  scroll?: boolean;
  className?: string;
};

/**
 * Fixed dark illustrated background used on all Student screens (doc 12 §4, §8.1).
 * Background is pinned to the viewport; content scrolls above it. Uses 100dvh and
 * is safe-area aware for Telegram Mini App.
 */
export function AppBackground({ children, overlay = "default", scroll = true, className }: AppBackgroundProps) {
  const classes = [
    "burro-bg",
    "app-background",
    `app-background--overlay-${overlay}`,
    scroll ? "app-background--scroll" : "app-background--fixed",
    className
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      <div className="app-background__overlay" aria-hidden="true" />
      <div className="app-background__content">{children}</div>
    </div>
  );
}
