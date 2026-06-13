import type { ReactNode } from "react";

export type BottomSheetProps = {
  /** Optional sheet title (passed in already localized). */
  title?: string;
  onClose: () => void;
  /** Accessible label for the close button, from the localization layer. */
  closeLabel?: string;
  children: ReactNode;
};

/**
 * Modal sheet that slides up from the bottom with a darkening overlay (doc 12 §9.13).
 * Used for the profile language selector. Safe-area aware at the bottom.
 */
export function BottomSheet({ title, onClose, closeLabel, children }: BottomSheetProps) {
  return (
    <div className="bottom-sheet" role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        className="bottom-sheet__overlay"
        aria-label={closeLabel}
        onClick={onClose}
      />
      <div className="bottom-sheet__panel">
        <div className="bottom-sheet__header">
          {title && <h2 className="bottom-sheet__title">{title}</h2>}
          <button
            type="button"
            className="bottom-sheet__close"
            onClick={onClose}
            aria-label={closeLabel}
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div className="bottom-sheet__body">{children}</div>
      </div>
    </div>
  );
}
