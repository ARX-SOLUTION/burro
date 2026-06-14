import { useCallback, useEffect, useLayoutEffect, useRef, useState, type FC } from "react";
import "./BottomNavbar.css";

/**
 * BottomNavbar - React port of the reference navbar in /index.html.
 * The raised bump, glow, and active item follow whichever tab is selected.
 */

type IconKey = "home" | "modules" | "learn" | "leaderboard" | "profile";

type NavItem = {
  id: string;
  label: string;
  icon: IconKey;
  ariaLabel: string;
};

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Asosiy", icon: "home", ariaLabel: "Asosiy sahifaga o'tish" },
  { id: "modules", label: "Modullar", icon: "modules", ariaLabel: "Modullar sahifasiga o'tish" },
  { id: "learn", label: "O'rganish", icon: "learn", ariaLabel: "O'rganish bo'limiga o'tish" },
  { id: "leaderboard", label: "Reyting", icon: "leaderboard", ariaLabel: "Reyting sahifasiga o'tish" },
  { id: "profile", label: "Profil", icon: "profile", ariaLabel: "Profil sahifasiga o'tish" }
];

const ICON_URLS: Record<IconKey, string> = {
  home: "/assets/icons/nav-home.svg",
  modules: "/assets/icons/nav-modules.svg",
  learn: "/assets/icons/nav-learn.svg",
  leaderboard: "/assets/icons/nav-leaderboard.svg",
  profile: "/assets/icons/nav-profile.svg"
};

const activeIndexFor = (active: string) => {
  const index = NAV_ITEMS.findIndex((item) => item.id === active);
  return index >= 0 ? index : 0;
};

export const BottomNavbar: FC<{ active?: string; onChange?: (id: string) => void }> = ({
  active = "dashboard",
  onChange
}) => {
  const navRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(() => activeIndexFor(active));
  const [poppingIndex, setPoppingIndex] = useState<number | null>(null);

  const updateBump = useCallback(() => {
    const nav = navRef.current;
    const item = itemRefs.current[activeIndex];
    if (!nav || !item) return;

    const navRect = nav.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    const center = itemRect.left + itemRect.width / 2 - navRect.left;
    nav.style.setProperty("--active-x", `${center}px`);
  }, [activeIndex]);

  useEffect(() => {
    setActiveIndex(activeIndexFor(active));
  }, [active]);

  useLayoutEffect(() => {
    updateBump();
  }, [updateBump]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(updateBump);
    window.addEventListener("resize", updateBump, { passive: true });

    let resizeObserver: ResizeObserver | undefined;
    if (typeof ResizeObserver !== "undefined" && navRef.current) {
      resizeObserver = new ResizeObserver(updateBump);
      resizeObserver.observe(navRef.current);
    }

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", updateBump);
      resizeObserver?.disconnect();
    };
  }, [updateBump]);

  useEffect(() => {
    setPoppingIndex(activeIndex);
    const timeout = window.setTimeout(() => setPoppingIndex(null), 430);
    return () => window.clearTimeout(timeout);
  }, [activeIndex]);

  const setActive = (index: number) => {
    setActiveIndex(index);
    onChange?.(NAV_ITEMS[index].id);
  };

  const handleKey = (event: React.KeyboardEvent, index: number) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;

    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const next = (index + direction + NAV_ITEMS.length) % NAV_ITEMS.length;
    itemRefs.current[next]?.focus();
    setActive(next);
  };

  return (
    <>
      <nav ref={navRef} className="burro-navbar" aria-label="Asosiy pastki navigatsiya">
        <span className="burro-navbar__glow" aria-hidden="true" />
        <span className="burro-navbar__bump" aria-hidden="true" />
        <span className="burro-navbar__body" aria-hidden="true" />
        <span className="burro-navbar__edge-light" aria-hidden="true" />

        <div className="burro-navbar__items" role="list">
          {NAV_ITEMS.map((item, index) => {
            const isActive = index === activeIndex;
            const isPopping = index === poppingIndex;
            const className = ["nav-item", isActive ? "is-active" : "", isPopping ? "is-popping" : ""]
              .filter(Boolean)
              .join(" ");

            return (
              <button
                key={item.id}
                ref={(element) => {
                  itemRefs.current[index] = element;
                }}
                className={className}
                type="button"
                role="listitem"
                data-index={index}
                data-icon={item.icon}
                aria-label={item.ariaLabel}
                aria-current={isActive ? "page" : undefined}
                onClick={() => setActive(index)}
                onKeyDown={(event) => handleKey(event, index)}
              >
                <span className="nav-item__icon-wrap">
                  <span className="nav-item__aura" aria-hidden="true" />
                  <span
                    className="nav-item__icon"
                    aria-hidden="true"
                    style={{ ["--icon" as string]: `url("${ICON_URLS[item.icon]}")` }}
                  />
                </span>
                <span className="nav-item__label">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
      <div className="burro-navbar__safe-area" aria-hidden="true" />
    </>
  );
};

export default BottomNavbar;
