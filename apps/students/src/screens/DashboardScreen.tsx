import { Link, useNavigate } from "@tanstack/react-router";
import { GlassCard } from "@burro/ui";
import type { ModuleCardDto } from "@burro/shared";
import { useDashboard } from "../features/dashboard/hooks";

/**
 * Home dashboard (doc 12 §9.3, doc 13 §6 — StudentDashboardDto target shape).
 * Six stacked sections inside the 402×874 phone canvas:
 *   1. Header (avatar + greeting + streak pill + sound icon)
 *   2. Last activity (green gradient continue card)
 *   3. Daily task (green card + +XP pill)
 *   4. Today result (2-col grid, white cards, Batafsil link)
 *   5. Modules carousel (horizontal scroller — reused module shape)
 *   6. Bottom nav slot (handled in router layout; reserves 112 + safe-area)
 *
 * Data is aggregated in features/dashboard/api.ts from /student/path,
 * /student/profile, /student/stats/summary, /student/dashboard. Each subcall
 * tolerates failure so the screen still renders against partial backend data.
 */
export function DashboardScreen() {
  const navigate = useNavigate();
  const { data, isPending, isError } = useDashboard();

  if (isPending) {
    return (
      <GlassCard>
        <p>Yuklanmoqda…</p>
      </GlassCard>
    );
  }

  if (isError || !data) {
    return (
      <GlassCard>
        <h2>Xatolik</h2>
        <p>Ma’lumotni yuklab bo‘lmadi.</p>
      </GlassCard>
    );
  }

  const { profile, lastActivity, dailyTask, today, modulesPreview } = data;
  const avatarInitial = profile.displayName.slice(0, 1).toUpperCase();

  return (
    <section className="dashboard-screen" aria-label="Bosh sahifa">
      <DashboardHeader displayName={profile.displayName} avatarInitial={avatarInitial} activeDays={profile.activeDays} />

      {lastActivity ? (
        <LastActivityCard
          eyebrow="Oxirgi aktivlik"
          title={lastActivity.title}
          progressText={lastActivity.progressText}
          progressPercent={lastActivity.progressPercent}
          estimatedMinutes={lastActivity.estimatedMinutes}
          onContinue={() =>
            navigate({ to: "/modules/$moduleId/practice", params: { moduleId: lastActivity.moduleId } })
          }
        />
      ) : (
        <EmptyLastActivityCard onStart={() => navigate({ to: "/modules" })} />
      )}

      <DailyTaskCard title={dailyTask.title} rewardXp={dailyTask.rewardXp} completed={dailyTask.completed} />

      <TodayResultSection learningMinutes={today.learningMinutes} xp={today.xp} />

      <ModulesStrip modules={modulesPreview} onModuleSelect={(moduleId) => navigate({ to: "/modules/$moduleId", params: { moduleId } })} />
    </section>
  );
}

function DashboardHeader({
  displayName,
  avatarInitial,
  activeDays
}: {
  displayName: string;
  avatarInitial: string;
  activeDays: number;
}) {
  const streakLabel = `${activeDays} day streak`;
  return (
    <header className="home-header" aria-label="Salom paneli">
      <div className="home-header__avatar" aria-hidden="true">
        {avatarInitial}
      </div>
      <div className="home-header__identity">
        <p className="home-header__greeting">
          Salom, <strong>{displayName}!</strong>
        </p>
        <span className="home-header__streak" aria-label={`${activeDays} kunlik streak`}>
          <span className="home-header__streak-bolt" aria-hidden="true" />
          {streakLabel}
        </span>
      </div>
      <button type="button" className="home-header__sound" aria-label="Ovoz sozlamalari">
        <span className="home-header__sound-icon" aria-hidden="true" />
      </button>
    </header>
  );
}

function LastActivityCard({
  eyebrow,
  title,
  progressText,
  progressPercent,
  estimatedMinutes,
  onContinue
}: {
  eyebrow: string;
  title: string;
  progressText: string;
  progressPercent: number;
  estimatedMinutes: number;
  onContinue: () => void;
}) {
  const clampedPercent = Math.max(0, Math.min(100, progressPercent));
  return (
    <article className="last-activity" aria-label={`${eyebrow}: ${title}`}>
      <p className="last-activity__eyebrow">{eyebrow}</p>
      <h2 className="last-activity__title">{title}</h2>
      <div className="last-activity__progress">
        <div className="last-activity__progress-meta">
          <span>{progressText}</span>
          <span>~{estimatedMinutes} min</span>
        </div>
        <div
          className="last-activity__progress-track"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={clampedPercent}
        >
          <span className="last-activity__progress-fill" style={{ width: `${clampedPercent}%` }} />
        </div>
      </div>
      <button type="button" className="last-activity__cta" onClick={onContinue}>
        <span className="last-activity__cta-icon" aria-hidden="true" />
        Davom etish
      </button>
    </article>
  );
}

function EmptyLastActivityCard({ onStart }: { onStart: () => void }) {
  return (
    <article className="last-activity last-activity--empty" aria-label="Oxirgi aktivlik">
      <p className="last-activity__eyebrow">Oxirgi aktivlik</p>
      <h2 className="last-activity__title">Birinchi modulni boshlang</h2>
      <p className="last-activity__description">Modullar ro‘yxatidan boshlashga tayyor bo‘lganini tanlang.</p>
      <button type="button" className="last-activity__cta" onClick={onStart}>
        Modullarni ko‘rish
      </button>
    </article>
  );
}

function DailyTaskCard({ title, rewardXp, completed }: { title: string; rewardXp: number; completed: boolean }) {
  return (
    <article className="daily-task-card" aria-label="Kunlik vazifa">
      <div>
        <p className="daily-task-card__eyebrow">Kunlik vazifa</p>
        <strong className="daily-task-card__title">{title}</strong>
      </div>
      <span className={`daily-task-card__reward${completed ? " daily-task-card__reward--done" : ""}`}>
        {completed ? "Bajarildi" : `+${rewardXp} XP`}
      </span>
    </article>
  );
}

function TodayResultSection({ learningMinutes, xp }: { learningMinutes: number; xp: number }) {
  return (
    <section className="today-result" aria-labelledby="today-result-title">
      <header className="section-heading">
        <h2 id="today-result-title">Bugungi natija</h2>
        <Link className="section-heading__link" to="/stats">
          Batafsil
        </Link>
      </header>
      <div className="today-result__grid">
        <article className="today-result__card today-result__card--minutes">
          <span>Kunlik</span>
          <strong>{learningMinutes} min</strong>
        </article>
        <article className="today-result__card today-result__card--xp">
          <span>XP</span>
          <strong>{xp}</strong>
        </article>
      </div>
    </section>
  );
}

function ModulesStrip({
  modules,
  onModuleSelect
}: {
  modules: ModuleCardDto[];
  onModuleSelect: (moduleId: string) => void;
}) {
  return (
    <section className="modules-strip" aria-labelledby="modules-strip-title">
      <header className="section-heading">
        <h2 id="modules-strip-title">Modullar</h2>
        <Link className="section-heading__link" to="/modules">
          Barchasi
        </Link>
      </header>
      {modules.length === 0 ? (
        <GlassCard>
          <p>Modullar tez orada qo‘shiladi.</p>
        </GlassCard>
      ) : (
        <div className="modules-strip__scroller">
          {modules.map((module) => (
            <ModuleStripCard key={module.id} module={module} onSelect={() => onModuleSelect(module.id)} />
          ))}
        </div>
      )}
    </section>
  );
}

function ModuleStripCard({ module, onSelect }: { module: ModuleCardDto; onSelect: () => void }) {
  const statusBadge = renderStatusBadge(module);
  const subtitleText = module.estimatedMinutes != null ? `${module.estimatedMinutes} min` : "";
  const isInteractive = module.status === "completed" || module.status === "current" || module.status === "available";

  return (
    <button
      type="button"
      className={`modules-strip__card modules-strip__card--${module.status}`}
      onClick={onSelect}
      disabled={!isInteractive}
      aria-label={`${module.title} — ${subtitleText}`}
    >
      <strong className="modules-strip__card-title">{module.title}</strong>
      {subtitleText ? <span className="modules-strip__card-meta">{subtitleText}</span> : null}
      <span className="modules-strip__card-status">{statusBadge}</span>
    </button>
  );
}

function renderStatusBadge(module: ModuleCardDto) {
  switch (module.status) {
    case "completed":
      return (
        <>
          <span className="modules-strip__status-dot modules-strip__status-dot--ok" aria-hidden="true" />
          Tugallandi
        </>
      );
    case "current":
      return (
        <>
          <span className="modules-strip__status-dot modules-strip__status-dot--cyan" aria-hidden="true" />
          Davom etmoqda
        </>
      );
    case "available":
      return (
        <>
          <span className="modules-strip__status-dot modules-strip__status-dot--cyan" aria-hidden="true" />
          Ochiq
        </>
      );
    case "premium_locked":
      return "Premium";
    case "locked":
      return "Qulflangan";
  }
}
