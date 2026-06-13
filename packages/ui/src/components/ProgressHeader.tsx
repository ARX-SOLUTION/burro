export function ProgressHeader({ title, progress }: { title: string; progress: string }) {
  return (
    <header className="progress-header">
      <strong>{title}</strong>
      <span className="progress-header__pill">{progress}</span>
    </header>
  );
}
