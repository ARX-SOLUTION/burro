export function FeedbackPanel({ type, text }: { type: "correct"|"wrong"; text: string }) { return <div className={`feedback ${type}`}>{text}</div>; }
