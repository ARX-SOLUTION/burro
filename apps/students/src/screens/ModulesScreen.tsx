import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { GlassCard, LearningPathNode } from "@burro/ui";
import type { ModuleCardDto, ModuleStatus } from "../features/modules/mock";
import { useStudentModules } from "../features/modules/hooks";

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
const ROUTABLE_STATUSES: ModuleStatus[] = ["completed", "current", "available"];

/** Arabic letters used as path-node glyphs when the backend has none. */
const FALLBACK_NODE_GLYPHS = ["ا", "ب", "ت", "ث", "ج", "ح", "خ", "د"];

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
      <span className="modules-grid-card__seq" aria-hidden="true">
        {module.sequenceNo}
      </span>
      <div className="modules-grid-card__body">
        <h3 className="modules-grid-card__title">{module.title}</h3>
        <p className="modules-grid-card__subtitle">{module.description}</p>
      </div>
      <div className="modules-grid-card__footer">
        {isDone ? (
          <span className="modules-grid-card__pill modules-grid-card__pill--done">
            <span className="modules-grid-card__pill-icon modules-grid-card__pill-icon--check" aria-hidden="true" />
            Tugallandi
          </span>
        ) : (
          <span className={`modules-grid-card__pill modules-grid-card__pill--${module.status}`}>
            <span className="modules-grid-card__pill-icon modules-grid-card__pill-icon--clock" aria-hidden="true" />
            {formatDuration(module)}
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
  const side = index % 2 === 0 ? "left" : "right";
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
    <li className={`modules-path__item modules-path__item--${side}`} data-status={module.status}>
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
  return (
    <ol className="modules-path" aria-label="O'quv modullari yo'li">
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
  // When path view is active we show the grid icon (tap to go to grid).
  // When grid view is active we show the path icon (tap to go to path).
  const next: ModulesView = view === "path" ? "grid" : "path";
  const label = next === "grid" ? "Katak ko'rinishi" : "Yo'l ko'rinishi";

  return (
    <button
      type="button"
      className={`modules-view-fab modules-view-fab--to-${next}`}
      aria-label={label}
      onClick={() => onChange(next)}
    >
      <span className={`modules-view-fab__icon modules-view-fab__icon--${next}`} aria-hidden="true" />
    </button>
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

  if (isPending) {
    return (
      <section className="modules-screen" aria-busy="true">
        <ModulesHeader />
        <GlassCard>
          <p>Modullar yuklanmoqda...</p>
        </GlassCard>
      </section>
    );
  }

  if (isError || !modules) {
    return (
      <section className="modules-screen" role="alert">
        <ModulesHeader />
        <GlassCard>
          <h2>Xatolik</h2>
          <p>Modullar ro'yxatini yuklab bo'lmadi.</p>
        </GlassCard>
      </section>
    );
  }

  if (modules.length === 0) {
    return (
      <section className="modules-screen">
        <ModulesHeader />
        <GlassCard>
          <h2>Hozircha modul yo'q</h2>
          <p>Modullar tez orada qo'shiladi.</p>
        </GlassCard>
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
