import type { HTMLAttributes, ReactNode } from "react";

export type GlassCardProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
};

export function GlassCard({ children, className, ...props }: GlassCardProps) {
  const classes = ["glass-card", className].filter(Boolean).join(" ");
  return (
    <section {...props} className={classes}>
      {children}
    </section>
  );
}
