export function XpCounter({ xp }: { xp: number }) {
  return (
    <span className="xp-counter">
      <span className="xp-counter__mark" aria-hidden="true" />
      {xp} XP
    </span>
  );
}
