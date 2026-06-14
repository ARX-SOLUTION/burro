import { useEffect, useState, type CSSProperties } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { GlassCard, LearningPathNode } from "@burro/ui";
import type { ModuleCardDto, ModuleCardStatus } from "@burro/shared";
import { useStudentModules } from "../features/modules/hooks";
import "./ModulesScreen.css";

/**
 * Modules screen (docs/12 §9.4 + §9.5, docs/13 §9).
 *
 * Renders BOTH the grid and the path view. The view choice is persisted to
 * `localStorage` under `burro.modules.view` and accepted from a `?view=` query
 * param so the router stays untouched while deep links still work.
 */

type ModulesView = "path" | "grid";

const MODULES_VIEW_STORAGE_KEY = "burro.modules.view";
const DEFAULT_VIEW: ModulesView = "path";

/** Statuses that route into the per-module detail screen. */
const ROUTABLE_STATUSES: ModuleCardStatus[] = ["completed", "current", "available"];

/** Arabic letters used as path-node glyphs when the backend has none. */
const FALLBACK_NODE_GLYPHS = ["ا", "ب", "ت", "ث", "ج", "ح", "خ", "د"];

type PathPoint = {
  x: number;
  y: number;
};

const PATH_CANVAS_WIDTH = 402;
const REFERENCE_PATH_POINTS: PathPoint[] = [
  { x: 91, y: 190 },
  { x: 223, y: 235 },
  { x: 316, y: 332 },
  { x: 141, y: 404 },
  { x: 253, y: 491 },
  { x: 109, y: 578 },
  { x: 267, y: 647 },
  { x: 333, y: 760 }
];

function readUrlView(): ModulesView | null {
  if (typeof window === "undefined") {
    return null;
  }
  const params = new URLSearchParams(window.location.search);
  const value = params.get("view");
  return value === "grid" || value === "path" ? value : null;
}

function readStoredView(): ModulesView | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const stored = window.localStorage.getItem(MODULES_VIEW_STORAGE_KEY);
    return stored === "grid" || stored === "path" ? stored : null;
  } catch {
    return null;
  }
}

function resolveInitialView(): ModulesView {
  return readUrlView() ?? readStoredView() ?? DEFAULT_VIEW;
}

function persistView(view: ModulesView) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(MODULES_VIEW_STORAGE_KEY, view);
  } catch {
    // Preference persistence is best-effort inside embedded webviews.
  }
}

function writeUrlView(view: ModulesView) {
  if (typeof window === "undefined") {
    return;
  }
  const params = new URLSearchParams(window.location.search);
  params.set("view", view);
  const next = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
  window.history.replaceState(null, "", next);
}

function isPremiumLocked(module: ModuleCardDto): boolean {
  return module.status === "premium_locked";
}

function isRoutable(module: ModuleCardDto): boolean {
  return ROUTABLE_STATUSES.includes(module.status);
}

function formatDuration(module: ModuleCardDto): string {
  if (module.estimatedMinutes == null) {
    return "—";
  }
  return `${module.estimatedMinutes} min`;
}

function pathGlyphFor(module: ModuleCardDto, index: number): string {
  // First letter of title is the cleanest signal once content is localized;
  // fall back to the curated Arabic letter list for the seed modules.
  const titleFirst = module.title.trim().charAt(0);
  if (titleFirst && titleFirst.match(/\p{Script=Arabic}/u)) {
    return titleFirst;
  }
  return FALLBACK_NODE_GLYPHS[index] ?? titleFirst ?? "•";
}

function pathPointFor(index: number): PathPoint {
  const reference = REFERENCE_PATH_POINTS[index];
  if (reference) {
    return reference;
  }

  const extraIndex = index - REFERENCE_PATH_POINTS.length;
  const previous = REFERENCE_PATH_POINTS[REFERENCE_PATH_POINTS.length - 1]!;
  const lane = extraIndex % 2 === 0 ? 91 : 267;

  return {
    x: lane,
    y: previous.y + 88 * (extraIndex + 1)
  };
}

function pathContentHeight(moduleCount: number): number {
  if (moduleCount === 0) {
    return 874;
  }

  return Math.max(874, pathPointFor(moduleCount - 1).y + 126);
}

function connectorPath(from: PathPoint, to: PathPoint): string {
  const controlX = (from.x + to.x) / 2;
  const controlY = from.y + (to.y - from.y) * 0.28;

  return `M ${from.x} ${from.y} Q ${controlX} ${controlY} ${to.x} ${to.y}`;
}

function pathItemStyle(index: number): CSSProperties {
  const point = pathPointFor(index);

  return {
    "--path-node-x": `${point.x}px`,
    "--path-node-y": `${point.y}px`
  } as CSSProperties;
}

function moduleGridStatusText(module: ModuleCardDto): string {
  if (module.status === "completed") {
    return "Tugallangan";
  }
  if (module.status === "premium_locked") {
    return "Premium";
  }
  if (module.status === "locked") {
    return "Qulflangan";
  }
  return formatDuration(module);
}

// ────────────────────────────────────────────────────────────────────────────
// Grid view
// ────────────────────────────────────────────────────────────────────────────

function ModuleGridCard({ module }: { module: ModuleCardDto }) {
  const isDone = module.status === "completed";
  const isPremium = isPremiumLocked(module);

  const card = (
    <article
      className={`modules-grid-card modules-grid-card--${module.status}`}
      data-status={module.status}
      aria-disabled={!isRoutable(module) && !isPremium}
    >
      <div className="modules-grid-card__body">
        <h3 className="modules-grid-card__title">{module.title}</h3>
        <p className="modules-grid-card__subtitle">{module.description}</p>
      </div>
      <div className="modules-grid-card__footer">
        {isDone ? (
          <span className="modules-grid-card__pill modules-grid-card__pill--done">
            <span className="modules-grid-card__pill-icon modules-grid-card__pill-icon--check" aria-hidden="true" />
            {moduleGridStatusText(module)}
          </span>
        ) : (
          <span className={`modules-grid-card__pill modules-grid-card__pill--${module.status}`}>
            <span className="modules-grid-card__pill-icon modules-grid-card__pill-icon--clock" aria-hidden="true" />
            {moduleGridStatusText(module)}
          </span>
        )}
      </div>
    </article>
  );

  if (isRoutable(module)) {
    return (
      <Link
        className="modules-grid-card-link"
        to="/modules/$moduleId"
        params={{ moduleId: module.id }}
        aria-label={`${module.title} modulini ochish`}
      >
        {card}
      </Link>
    );
  }

  if (isPremium) {
    return (
      <Link
        className="modules-grid-card-link modules-grid-card-link--premium"
        to="/premium"
        aria-label={`${module.title} — Premium kerak`}
      >
        {card}
      </Link>
    );
  }

  return (
    <div className="modules-grid-card-link modules-grid-card-link--locked" aria-label={`${module.title} — qulflangan`}>
      {card}
    </div>
  );
}

function ModulesGridView({ modules }: { modules: ModuleCardDto[] }) {
  return (
    <div className="modules-grid" aria-label="O'quv modullari">
      {modules.map((module) => (
        <ModuleGridCard key={module.id} module={module} />
      ))}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Path view
// ────────────────────────────────────────────────────────────────────────────

function ModulePathItem({
  module,
  index,
  onSelect
}: {
  module: ModuleCardDto;
  index: number;
  onSelect: (module: ModuleCardDto) => void;
}) {
  const isBlocked = module.status === "locked" || module.status === "premium_locked";
  const labelStatus =
    module.status === "completed"
      ? "Tugallandi"
      : module.status === "current"
        ? `${module.progressPercent}%`
        : module.status === "available"
          ? formatDuration(module)
          : module.status === "premium_locked"
            ? "Premium"
            : "Qulflangan";

  return (
    <li
      className="modules-path__item"
      data-current={module.status === "current" ? "true" : undefined}
      data-status={module.status}
      style={pathItemStyle(index)}
    >
      <div className="modules-path__node">
        <LearningPathNode
          status={module.status}
          icon={pathGlyphFor(module, index)}
          ariaLabel={`${module.title} (${labelStatus})`}
          onClick={isBlocked && module.status !== "premium_locked" ? undefined : () => onSelect(module)}
        />
      </div>
      <div className="modules-path__label" aria-hidden={isBlocked ? "true" : undefined}>
        <span className="modules-path__label-title">{module.title}</span>
        <span className="modules-path__label-meta">{labelStatus}</span>
      </div>
    </li>
  );
}

function ModulesPathView({
  modules,
  onSelect
}: {
  modules: ModuleCardDto[];
  onSelect: (module: ModuleCardDto) => void;
}) {
  const contentHeight = pathContentHeight(modules.length);
  const points = modules.map((_, index) => pathPointFor(index));

  return (
    <ol className="modules-path" aria-label="O'quv modullari yo'li" style={{ minHeight: contentHeight }}>
      <svg
        className="modules-path__connector"
        width={PATH_CANVAS_WIDTH}
        height={contentHeight}
        viewBox={`0 0 ${PATH_CANVAS_WIDTH} ${contentHeight}`}
        aria-hidden="true"
        focusable="false"
      >
        {points.slice(0, -1).map((point, index) => (
          <path key={`${point.x}-${point.y}`} d={connectorPath(point, points[index + 1]!)} />
        ))}
      </svg>
      {modules.map((module, index) => (
        <ModulePathItem key={module.id} module={module} index={index} onSelect={onSelect} />
      ))}
    </ol>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Header + view toggle
// ────────────────────────────────────────────────────────────────────────────

function ModulesHeader() {
  return (
    <header className="modules-screen__header">
      <h2>Modullar</h2>
      <button className="modules-screen__language" type="button" aria-label="Tilni o'zgartirish">
        <span className="modules-screen__flag" aria-hidden="true" />
      </button>
    </header>
  );
}

function ModulesViewToggle({
  view,
  onChange
}: {
  view: ModulesView;
  onChange: (next: ModulesView) => void;
}) {
  return (
    <div className="modules-view-toggle" role="group" aria-label="Modul ko'rinishi">
      <button
        type="button"
        className={`modules-view-toggle__button modules-view-toggle__button--path${view === "path" ? " is-active" : ""}`}
        aria-label="Yo'l ko'rinishi"
        aria-pressed={view === "path"}
        onClick={() => onChange("path")}
      >
        <span className="modules-view-toggle__icon modules-view-toggle__icon--path" aria-hidden="true" />
      </button>
      <button
        type="button"
        className={`modules-view-toggle__button modules-view-toggle__button--grid${view === "grid" ? " is-active" : ""}`}
        aria-label="Katak ko'rinishi"
        aria-pressed={view === "grid"}
        onClick={() => onChange("grid")}
      >
        <span className="modules-view-toggle__icon modules-view-toggle__icon--grid" aria-hidden="true" />
      </button>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Screen
// ────────────────────────────────────────────────────────────────────────────

export function ModulesScreen() {
  const navigate = useNavigate();
  const { data: modules, isPending, isError } = useStudentModules();
  const [view, setView] = useState<ModulesView>(resolveInitialView);

  // Mirror the current view into both the URL and localStorage so reload
  // and deep links agree.
  useEffect(() => {
    persistView(view);
    writeUrlView(view);
  }, [view]);

  function handleSelect(module: ModuleCardDto) {
    if (module.status === "premium_locked") {
      navigate({ to: "/premium" });
      return;
    }
    if (module.status === "locked") {
      // Locked tap is a no-op by spec; future iteration may surface a toast.
      return;
    }
    navigate({ to: "/modules/$moduleId", params: { moduleId: module.id } });
  }

  useEffect(() => {
    if (view !== "path" || !modules) {
      return;
    }

    const scroller = document.querySelector<HTMLElement>(".modules-screen--path .modules-screen__body");
    const currentNode = scroller?.querySelector<HTMLElement>(".modules-path__item[data-current='true']");
    if (!scroller || !currentNode) {
      return;
    }

    scroller.scrollTop = Math.max(0, currentNode.offsetTop - scroller.clientHeight / 2 + currentNode.offsetHeight / 2);
  }, [modules, view]);

  if (isPending) {
    return (
      <section className="modules-screen modules-screen--state" aria-busy="true">
        <ModulesHeader />
        <div className="modules-screen__state-card">
          <GlassCard>
            <p>Modullar yuklanmoqda...</p>
          </GlassCard>
        </div>
      </section>
    );
  }

  if (isError || !modules) {
    return (
      <section className="modules-screen modules-screen--state" role="alert">
        <ModulesHeader />
        <div className="modules-screen__state-card">
          <GlassCard>
            <h2>Xatolik</h2>
            <p>Modullar ro'yxatini yuklab bo'lmadi.</p>
          </GlassCard>
        </div>
      </section>
    );
  }

  if (modules.length === 0) {
    return (
      <section className="modules-screen modules-screen--state">
        <ModulesHeader />
        <div className="modules-screen__state-card">
          <GlassCard>
            <h2>Hozircha modul yo'q</h2>
            <p>Modullar tez orada qo'shiladi.</p>
          </GlassCard>
        </div>
      </section>
    );
  }

  return (
    <section className={`modules-screen modules-screen--${view}`} data-view={view}>
      <ModulesHeader />
      <div className="modules-screen__body">
        {view === "path" ? (
          <ModulesPathView modules={modules} onSelect={handleSelect} />
        ) : (
          <ModulesGridView modules={modules} />
        )}
      </div>
      <ModulesViewToggle view={view} onChange={setView} />
    </section>
  );
}
