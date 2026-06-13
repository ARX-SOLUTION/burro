export function AnswerOption({ label, state, onClick }: { label: string; state?: "selected" | "correct" | "wrong"; onClick?: () => void }) {
  return (
    <button className={["answer-option", state].filter(Boolean).join(" ")} onClick={onClick} type="button">
      {label}
    </button>
  );
}
