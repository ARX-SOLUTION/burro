import type { ReactNode } from "react";

export type FeedbackCardType = "correct" | "wrong" | "module_completed";

export type FeedbackCardProps = {
  type: FeedbackCardType;
  /** Primary message. Text comes from the caller / localization layer. */
  text: string;
  /** Optional secondary content (XP, accuracy, actions). */
  children?: ReactNode;
};

export function FeedbackCard({ type, text, children }: FeedbackCardProps) {
  return (
    <div className={`feedback feedback-card feedback-card--${type} ${type}`} role="status" data-type={type}>
      <p className="feedback-card__text">{text}</p>
      {children}
    </div>
  );
}
