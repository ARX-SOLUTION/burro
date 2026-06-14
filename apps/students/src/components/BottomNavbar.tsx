import { useCallback, useEffect, useRef, useState, type FC } from "react";
import "./BottomNavbar.css";

/**
 * BottomNavbar — 1:1 port of /Users/admin/Pictures/burro-navbar-artifact/index.html.
 * The notch + cyan center button slide to whichever item is active, the SVG
 * clip-path is rebuilt per active position, and the shell glow follows.
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

const fmt = (n: number) => Number(n).toFixed(3).replace(/\.000$/, "");

/** Dynamic Union path keyed by the active item's x in source coords (0..386). */
function figmaPath(cx: number): string {
  const c = Number(cx);
  const leftShoulder = c - 57.032;
  const rightShoulder = c + 57.032;
  const rightTop =
    rightShoulder <= 354
      ? [`H354`, `C371.673 22.939 386 37.265 386 54.939`]
      : [`C${fmt(Math.min(386, rightShoulder + 18))} 22.939 386 37.265 386 54.939`];
  const leftTop =
    leftShoulder >= 32
      ? [`C0 37.265 14.327 22.939 32 22.939`, `H${fmt(leftShoulder)}`]
      : [`C0 37.265 ${fmt(Math.max(0, leftShoulder - 18))} 22.939 ${fmt(leftShoulder)} 22.939`];
  return [
    `M${fmt(c)} 0`,
    `C${fmt(c + 9.301)} 0 ${fmt(c + 17.895)} 3.023 ${fmt(c + 24.854)} 8.141`,
    `C${fmt(c + 34.544)} 15.265 ${fmt(c + 45.005)} 22.939 ${fmt(rightShoulder)} 22.939`,
    ...rightTop,
    `V89`,
    `C386 106.673 371.673 121 354 121`,
    `H32`,
    `C14.327 121 0 106.673 0 89`,
    `V54.939`,
    ...leftTop,
    `C${fmt(c - 45.005)} 22.939 ${fmt(c - 34.544)} 15.265 ${fmt(c - 24.854)} 8.141`,
    `C${fmt(c - 17.895)} 3.023 ${fmt(c - 9.301)} 0 ${fmt(c)} 0`,
    `Z`
  ].join(" ");
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export const BottomNavbar: FC<{ active?: string; onChange?: (id: string) => void }> = ({
  active = "dashboard",
  onChange
}) => {
  const navRef = useRef<HTMLElement | null>(null);
  const clipPathRef = useRef<SVGPathElement | null>(null);
  const strokePathRef = useRef<SVGPathElement | null>(null);
  const activeGlowRef = useRef<SVGCircleElement | null>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const rafRef = useRef<number | null>(null);
  const currentXRef = useRef(193);

  const startIndex = Math.max(0, NAV_ITEMS.findIndex((item) => item.id === active));
  const [activeIndex, setActiveIndex] = useState(startIndex === -1 ? 0 : startIndex);
  const [poppingIndex, setPoppingIndex] = useState<number | null>(null);

  // Keep state in sync if router-driven active prop changes.
  useEffect(() => {
    const i = NAV_ITEMS.findIndex((item) => item.id === active);
    if (i >= 0) setActiveIndex(i);
  }, [active]);

  const drawShell = useCallback((cx: number, glowX: number) => {
    const d = figmaPath(cx);
    clipPathRef.current?.setAttribute("d", d);
    strokePathRef.current?.setAttribute("d", d);
    activeGlowRef.current?.setAttribute("cx", String(glowX));
  }, []);

  const itemCenterInSourcePx = useCallback((index: number): number => {
    const nav = navRef.current;
    const item = itemRefs.current[index];
    if (!nav || !item) return 193;
    const navRect = nav.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    const rendered = itemRect.left + itemRect.width / 2 - navRect.left;
    const scale = 386 / navRect.width;
    return rendered * scale;
  }, []);

  const setShellX = useCallback(
    (x: number, instant = false) => {
      const clamped = Math.max(58, Math.min(328, x));
      navRef.current?.style.setProperty("--active-x-visual", `${clamped}px`);
      if (instant) {
        currentXRef.current = clamped;
        drawShell(clamped, clamped);
        return;
      }
      const start = currentXRef.current;
      const delta = clamped - start;
      const startedAt = performance.now();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      const tick = (now: number) => {
        const t = Math.min(1, (now - startedAt) / 520);
        const next = start + delta * easeOutCubic(t);
        currentXRef.current = next;
        drawShell(next, clamped);
        if (t < 1) rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    },
    [drawShell]
  );

  // Recompute shell position whenever active changes or the navbar resizes.
  useEffect(() => {
    const update = (instant: boolean) => setShellX(itemCenterInSourcePx(activeIndex), instant);
    update(true);
    const onResize = () => update(true);
    window.addEventListener("resize", onResize, { passive: true });
    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== "undefined" && navRef.current) {
      ro = new ResizeObserver(() => update(true));
      ro.observe(navRef.current);
    }
    return () => {
      window.removeEventListener("resize", onResize);
      ro?.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setShellX(itemCenterInSourcePx(activeIndex), false);
    setPoppingIndex(activeIndex);
    const t = window.setTimeout(() => setPoppingIndex(null), 520);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  const handleClick = (index: number) => {
    setActiveIndex(index);
    onChange?.(NAV_ITEMS[index].id);
  };

  const handleKey = (event: React.KeyboardEvent, index: number) => {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const next = (index + direction + NAV_ITEMS.length) % NAV_ITEMS.length;
      itemRefs.current[next]?.focus();
      setActiveIndex(next);
      onChange?.(NAV_ITEMS[next].id);
    }
  };

  const renderItem = (item: NavItem, index: number) => {
    const isActive = index === activeIndex;
    const isCenter = index === 2;
    const isPopping = poppingIndex === index;
    const className = [
      "nav-item",
      isCenter ? "nav-item--center" : "",
      isActive ? "is-active" : "",
      isPopping ? "is-popping" : ""
    ]
      .filter(Boolean)
      .join(" ");
    return (
      <button
        key={item.id}
        ref={(el) => {
          itemRefs.current[index] = el;
        }}
        type="button"
        role="listitem"
        className={className}
        data-index={index}
        aria-label={item.ariaLabel}
        aria-current={isActive ? "page" : undefined}
        onClick={() => handleClick(index)}
        onKeyDown={(event) => handleKey(event, index)}
      >
        <span className="nav-icon-wrap">
          <span
            className="nav-icon"
            style={{ ["--icon" as string]: `url("${ICON_URLS[item.icon]}")` }}
          />
        </span>
        <span className="nav-label">{item.label}</span>
      </button>
    );
  };

  return (
    <nav ref={navRef} className="burro-navbar" aria-label="Asosiy pastki navigatsiya">
      <div className="burro-navbar__scale">
        <span className="burro-navbar__glow" aria-hidden="true" />

        <svg className="burro-navbar__svg" viewBox="0 0 386 121" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="baseBlue" x1="193" y1="0" x2="193" y2="121" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#203480" />
              <stop offset="1" stopColor="#1B359A" />
            </linearGradient>
            <linearGradient id="cyanA" x1="103" y1="5" x2="367" y2="112" gradientUnits="userSpaceOnUse">
              <stop offset="0.6978" stopColor="#12B7E5" stopOpacity="0" />
              <stop offset="0.9827" stopColor="#12B7E5" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="cyanB" x1="344" y1="-23" x2="95" y2="128" gradientUnits="userSpaceOnUse">
              <stop offset="0.6079" stopColor="#12B7E5" stopOpacity="0" />
              <stop offset="1" stopColor="#12B7E5" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="topGloss" x1="193" y1="0" x2="193" y2="81" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFFFFF" stopOpacity="0.085" />
              <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
            <radialGradient id="activeGlow" cx="50%" cy="14%" r="55%">
              <stop offset="0" stopColor="#12B7E5" stopOpacity="0.22" />
              <stop offset="0.52" stopColor="#12B7E5" stopOpacity="0.07" />
              <stop offset="1" stopColor="#12B7E5" stopOpacity="0" />
            </radialGradient>
            <clipPath id="shellClip">
              <path ref={clipPathRef} d="" />
            </clipPath>
            <filter id="innerSoft" x="-10%" y="-10%" width="120%" height="130%">
              <feFlood floodColor="#FFFFFF" floodOpacity="0.09" result="flood" />
              <feComposite in="flood" in2="SourceAlpha" operator="out" result="composite" />
              <feGaussianBlur in="composite" stdDeviation="6.7" />
              <feComposite operator="atop" in2="SourceGraphic" />
            </filter>
          </defs>

          <g clipPath="url(#shellClip)" filter="url(#innerSoft)">
            <rect width="386" height="121" fill="url(#baseBlue)" />
            <rect width="386" height="121" fill="url(#cyanA)" />
            <rect width="386" height="121" fill="url(#cyanB)" />
            <rect className="shell-top-light" width="386" height="121" fill="url(#topGloss)" />
            <circle
              ref={activeGlowRef}
              className="shell-active-light"
              cx="193"
              cy="22"
              r="72"
              fill="url(#activeGlow)"
            />
            <g className="shell-stripes">
              <path
                d="M-86 121L-27 0H-18L-77 121H-86ZM-42 121L17 0H26L-33 121H-42ZM2 121L61 0H70L11 121H2ZM46 121L105 0H114L55 121H46ZM90 121L149 0H158L99 121H90ZM134 121L193 0H202L143 121H134ZM178 121L237 0H246L187 121H178ZM222 121L281 0H290L231 121H222ZM266 121L325 0H334L275 121H266ZM310 121L369 0H378L319 121H310ZM354 121L413 0H422L363 121H354ZM398 121L457 0H466L407 121H398Z"
                fill="#FFFFFF"
              />
            </g>
          </g>
          <path ref={strokePathRef} d="" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="1" />
        </svg>

        <div className="burro-navbar__content" role="list">
          <div className="nav-group" role="presentation">
            {renderItem(NAV_ITEMS[0], 0)}
            {renderItem(NAV_ITEMS[1], 1)}
          </div>

          <div className="nav-center-slot" role="presentation">
            {renderItem(NAV_ITEMS[2], 2)}
          </div>

          <div className="nav-group nav-group--right" role="presentation">
            {renderItem(NAV_ITEMS[3], 3)}
            {renderItem(NAV_ITEMS[4], 4)}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default BottomNavbar;
