import { Link } from "@tanstack/react-router";
import { GlassCard } from "@burro/ui";
import { useState } from "react";
import type { ModuleCardDto, ModuleStatus } from "../features/modules/mock";
import { useStudentModules } from "../features/modules/hooks";

type ModulesView = "path" | "grid";

const modulesViewStorageKey = "burro.modules.view";
const clickableStatuses: ModuleStatus[] = ["completed", "current", "available"];

function readStoredModulesView(): ModulesView {
  if (typeof window === "undefined") {
    return "grid";
  }

  try {
    const storedView = window.localStorage.getItem(modulesViewStorageKey);
    return storedView === "grid" || storedView === "path" ? storedView : "grid";
  } catch {
    return "grid";
  }
}

function getStatusLabel(status: ModuleStatus): string {
  switch (status) {
    case "completed":
      return "Yakunlangan";
    case "current":
      return "Davom etmoqda";
    case "available":
      return "Ochiq";
    case "locked":
      return "Qulflangan";
    case "premium_locked":
      return "Premium";
  }
}

function getModuleSubtitle(module: ModuleCardDto): string {
  const duration = module.estimatedMinutes === null ? "Vaqt belgilanmagan" : `${module.estimatedMinutes} daqiqa`;
  return `${getStatusLabel(module.status)} · ${duration}`;
}

function isModuleRouteEnabled(status: ModuleStatus): boolean {
  return clickableStatuses.includes(status);
}

function ModuleListItem({ module, view }: { module: ModuleCardDto; view: ModulesView }) {
  const card = <article
    className={`student-module-card student-module-card--${module.status}`}
    aria-disabled={!isModuleRouteEnabled(module.status) && module.status !== "premium_locked"}
    data-view={view}
  >
    <div className="student-module-card__header">
      <span className="student-module-card__sequence">{module.sequenceNo}</span>
      <div>
        <h3 className="student-module-card__title">{module.title}</h3>
        <p className="student-module-card__subtitle">{getModuleSubtitle(module)}</p>
      </div>
    </div>
    {view === "path" ? <p className="student-module-card__description">{module.description}</p> : null}
    <div className="student-module-card__meta">
      <span className="student-module-card__status">{getStatusLabel(module.status)}</span>
      {module.premiumRequired ? <span className="student-module-card__premium">Premium</span> : null}
    </div>
    {view === "path" ? (
      <progress
        className="student-module-card__progress"
        max={100}
        value={module.progressPercent}
        aria-label={`${module.title} progressi ${module.progressPercent}%`}
      />
    ) : null}
  </article>;

  if (isModuleRouteEnabled(module.status)) {
    return <Link
      className="student-module-card-link"
      to="/modules/$moduleId"
      params={{ moduleId: module.id }}
    >
      {card}
    </Link>;
  }

  if (module.status === "premium_locked") {
    return <Link className="student-module-card-link student-module-card-link--premium" to="/premium">
      {card}
    </Link>;
  }

  return card;
}

export function ModulesScreen() {
  const { data: modules, isPending, isError } = useStudentModules();
  const [view, setView] = useState<ModulesView>(readStoredModulesView);

  function updateView(nextView: ModulesView) {
    setView(nextView);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(modulesViewStorageKey, nextView);
      } catch {
        // Preference persistence is best-effort in embedded webviews.
      }
    }
  }

  if (isPending) {
    return <GlassCard><p>Modullar yuklanmoqda...</p></GlassCard>;
  }

  if (isError || !modules) {
    return <GlassCard><h2>Xatolik</h2><p>Modullar ro‘yxatini yuklab bo‘lmadi.</p></GlassCard>;
  }

  if (modules.length === 0) {
    return <GlassCard><h2>Modullar</h2><p>Hozircha modullar mavjud emas.</p></GlassCard>;
  }

  return <>
    <header className="modules-screen__header">
      <div>
        <h2>Modullar</h2>
        <p className="modules-screen__summary">{modules.length} ta modul</p>
      </div>
      <div className="modules-view-toggle" role="group" aria-label="Modullar ko‘rinishi">
        <button
          className="modules-view-toggle__button"
          type="button"
          aria-pressed={view === "path"}
          onClick={() => updateView("path")}
        >
          <span className="modules-view-toggle__icon modules-view-toggle__icon--path" aria-hidden="true" />
          <span className="sr-only">Yo'l</span>
        </button>
        <button
          className="modules-view-toggle__button"
          type="button"
          aria-pressed={view === "grid"}
          onClick={() => updateView("grid")}
        >
          <span className="modules-view-toggle__icon modules-view-toggle__icon--grid" aria-hidden="true" />
          <span className="sr-only">Katak</span>
        </button>
      </div>
    </header>

    {view === "path" ? <ol className="modules-path" aria-label="O‘quv modullari yo‘li">
      {modules.map((module) => <li className="modules-path__item" key={module.id}>
        <ModuleListItem module={module} view={view} />
      </li>)}
    </ol> : <div className="grid modules-grid" aria-label="O‘quv modullari">
      {modules.map((module) => <ModuleListItem key={module.id} module={module} view={view} />)}
    </div>}
  </>;
}
