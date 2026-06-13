const navItems = [
  { key: "dashboard", label: "Asosiy", icon: "home" },
  { key: "modules", label: "Modullar", icon: "grid" },
  { key: "learn", label: "O'rganish", icon: "play" },
  { key: "leaderboard", label: "Reyting", icon: "bars" },
  { key: "profile", label: "Profil", icon: "user" }
] as const;

export function BottomNav({ active, onChange }: { active: string; onChange: (tab: string) => void }) {
  return (
    <nav className="bottom-nav" aria-label="Asosiy navigatsiya">
      {navItems.map((item) => (
        <button
          key={item.key}
          type="button"
          className={["bottom-nav__item", item.key === "learn" ? "bottom-nav__item--primary" : "", active === item.key ? "active" : ""].filter(Boolean).join(" ")}
          onClick={() => onChange(item.key)}
        >
          <span className={`bottom-nav__icon bottom-nav__icon--${item.icon}`} aria-hidden="true" />
          <span className="bottom-nav__label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
