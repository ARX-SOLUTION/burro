import type { CSSProperties, ReactNode } from "react";

export type AppBackgroundOverlay = "default" | "heavy" | "light";

/** `app` = mosque illustration (default for in-app screens); `welcome` = welcome hero photo. */
export type AppBackgroundVariant = "app" | "welcome";

export type AppBackgroundProps = {
  children: ReactNode;
  /** Strength of the dark readability overlay over the illustrated background. */
  overlay?: AppBackgroundOverlay;
  /** When true (default) the content area scrolls above the fixed background. */
  scroll?: boolean;
  /** Selects the variant background image; defaults to the in-app mosque illustration. */
  variant?: AppBackgroundVariant;
  /** Explicit background image URL. Overrides `variant` when provided. */
  image?: string;
  className?: string;
};

/**
 * Fixed dark illustrated background used on all Student screens (doc 12 §4, §8.1).
 * Background is pinned to the viewport; content scrolls above it. Uses 100dvh and
 * is safe-area aware for Telegram Mini App. The background image is driven by the
 * `--app-bg-image` CSS variable so variants/consumers can swap it without new classes.
 */
export function AppBackground({
  children,
  overlay = "default",
  scroll = true,
  variant = "app",
  image,
  className
}: AppBackgroundProps) {
  const classes = [
    "burro-bg",
    "app-background",
    `app-background--${variant}`,
    `app-background--overlay-${overlay}`,
    scroll ? "app-background--scroll" : "app-background--fixed",
    className
  ]
    .filter(Boolean)
    .join(" ");

  const style = image ? ({ ["--app-bg-image"]: `url('${image}')` } as CSSProperties) : undefined;

  return (
    <div className={classes} style={style}>
      <div className="app-background__overlay" aria-hidden="true" />
      <div className="app-background__content">{children}</div>
    </div>
  );
}
