import { useState, useEffect, useCallback, type FC } from "react";
import "./BottomNavbar.css";

type NavItem = {
  id: string;
  label: string;
  icon: "home" | "grid" | "play" | "chart" | "user";
  ariaLabel: string;
  isCenter?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Asosiy", icon: "home", ariaLabel: "Asosiy sahifaga o‘tish" },
  { id: "modules", label: "Modullar", icon: "grid", ariaLabel: "Modullar sahifasiga o‘tish" },
  { id: "learn", label: "O‘rganish", icon: "play", ariaLabel: "O‘rganish bo‘limiga o‘tish", isCenter: true },
  { id: "leaderboard", label: "Reyting", icon: "chart", ariaLabel: "Reyting sahifasiga o‘tish" },
  { id: "profile", label: "Profil", icon: "user", ariaLabel: "Profil sahifasiga o‘tish" },
];

const GRADIENT_ID = "nav-icon-grad";

function NavIcon({ icon, size = 28 }: { icon: string; size?: number }) {
  switch (icon) {
    case "home":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={`url(#${GRADIENT_ID})`}>
          <path d="M3 14h2v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7h2a.998.998 0 0 0 .913-.593.998.998 0 0 0-.17-1.076l-9-10c-.379-.422-1.107-.422-1.486 0l-9 10A1 1 0 0 0 3 14zm5.949-.316C8.98 13.779 9.762 16 12 16c2.269 0 3.042-2.287 3.05-2.311l1.9.621C16.901 14.461 15.703 18 12 18s-4.901-3.539-4.95-3.689l1.899-.627z"/>
        </svg>
      );
    case "grid":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={`url(#${GRADIENT_ID})`}>
          <path d="M4 4h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 10h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 16h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4z"/>
        </svg>
      );
    case "chart":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={`url(#${GRADIENT_ID})`}>
          <path d="M6 21H3a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1zm7 0h-3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v17a1 1 0 0 1-1 1zm7 0h-3a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1z"/>
        </svg>
      );
    case "user":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={`url(#${GRADIENT_ID})`}>
          <path d="M8 12.052c1.995 0 3.5-1.505 3.5-3.5s-1.505-3.5-3.5-3.5-3.5 1.505-3.5 3.5 1.505 3.5 3.5 3.5zM9 13H7c-2.757 0-5 2.243-5 5v1h12v-1c0-2.757-2.243-5-5-5zm11.294-4.708-4.3 4.292-1.292-1.292-1.414 1.414 2.706 2.704 5.712-5.702z"/>
        </svg>
      );
    case "play":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
          <polygon points="8,5 19,12 8,19"/>
        </svg>
      );
    default:
      return null;
  }
}

export const BottomNavbar: FC<{ active?: string; onChange?: (id: string) => void }> = ({
  active = "dashboard",
  onChange,
}) => {
  const [current, setCurrent] = useState(active);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCurrent(active);
  }, [active]);

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const handleTap = useCallback(
    (id: string) => {
      setCurrent(id);
      onChange?.(id);
    },
    [onChange],
  );

  return (
    <nav
      className={`bottom-navbar${mounted ? " bottom-navbar--mounted" : ""}`}
      aria-label="Asosiy navigatsiya"
    >
      {/* Hidden SVG gradient defs for icon fills */}
      <svg width={0} height={0} aria-hidden="true" style={{ position: "absolute" }}>
        <defs>
          <linearGradient id={GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.5)" />
          </linearGradient>
        </defs>
      </svg>

      {/* Center bump background shape */}
      <div className="bottom-navbar__bump" aria-hidden="true" />

      {/* Center button aura */}
      <div className="bottom-navbar__aura" aria-hidden="true" />

      {/* Diagonal texture overlay */}
      <div className="bottom-navbar__texture" aria-hidden="true" />

      {/* Menu items */}
      {NAV_ITEMS.map((item) => {
        const isActive = current === item.id;
        const isCenter = Boolean(item.isCenter);

        return (
          <button
            key={item.id}
            type="button"
            className={[
              "bottom-navbar__item",
              isCenter ? "bottom-navbar__item--center" : "",
              isActive ? "bottom-navbar__item--active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => handleTap(item.id)}
            aria-label={item.ariaLabel}
            aria-current={isActive ? "page" : undefined}
          >
            {/* Center button background glow */}
            {isCenter && (
              <>
                <span className="bottom-navbar__center-bg" aria-hidden="true" />
                <span className="bottom-navbar__center-ring" aria-hidden="true" />
              </>
            )}

            <span
              className={[
                "bottom-navbar__icon-wrap",
                isCenter ? "bottom-navbar__icon-wrap--center" : "",
                isActive && !isCenter ? "bottom-navbar__icon-wrap--active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <NavIcon icon={item.icon} size={isCenter ? 20 : 28} />
            </span>

            <span
              className={[
                "bottom-navbar__label",
                isActive ? "bottom-navbar__label--active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNavbar;
