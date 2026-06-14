const podium = [
  { place: 2, name: "Ali", score: "720 XP" },
  { place: 1, name: "Amina", score: "840 XP" },
  { place: 3, name: "Omar", score: "680 XP" }
];

export function LeaderboardPodium() {
  return (
    <div className="podium" aria-label="Eng yuqori o'rinlar">
      {podium.map((student) => (
        <article className={`podium__item podium__item--${student.place}`} key={student.place}>
          <span className="podium__avatar" aria-hidden="true">{student.name.slice(0, 1)}</span>
          <span className="podium__place">#{student.place}</span>
          <strong>{student.name}</strong>
          <span>{student.score}</span>
        </article>
      ))}
    </div>
  );
}
