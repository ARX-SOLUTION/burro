export function HeartCounter({ hearts }: { hearts: number }) {
  return (
    <span className="heart-counter" aria-label={`${hearts} ta jon qoldi`}>
      {Array.from({ length: Math.max(0, hearts) }, (_, index) => (
        <span className="heart-counter__dot" key={index} aria-hidden="true" />
      ))}
    </span>
  );
}
