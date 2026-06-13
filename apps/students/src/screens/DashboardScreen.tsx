import { useNavigate } from "@tanstack/react-router";
import { GlassCard, GradientButton } from "@burro/ui";
import { useDashboard } from "../features/dashboard/hooks";
import { useLevel } from "../features/level/hooks";

export function DashboardScreen() {
  const navigate = useNavigate();
  const { data, isPending, isError } = useDashboard();
  const { data: levelInfo } = useLevel();

  if (isPending) {
    return <GlassCard><p>Yuklanmoqda...</p></GlassCard>;
  }
  if (isError || !data) {
    return <GlassCard><h2>Xatolik</h2><p>Ma’lumotni yuklab bo‘lmadi.</p></GlassCard>;
  }

  const level = levelInfo?.level ?? 2;
  const totalXp = levelInfo?.totalXp ?? 180;
  const progressPercent = levelInfo?.progressPercent ?? 62;

  return (
    <section className="dashboard-screen">
      <header className="dashboard-top">
        <div className="student-avatar" aria-hidden="true">{data.studentName.slice(0, 1)}</div>
        <div>
          <p className="dashboard-top__eyebrow">Salom, {data.studentName}</p>
          <h1>Bugungi mashq</h1>
        </div>
        <button className="round-icon round-icon--bell" type="button" aria-label="Bildirishnomalar" />
      </header>

      <GlassCard>
        <div className="continue-card">
          <div>
            <p className="continue-card__eyebrow">Oxirgi aktivlik</p>
            <h2>Arab harflari</h2>
            <p>Harflarni ko'rib, to'g'ri javobni tanlang.</p>
          </div>
          <GradientButton onClick={() => navigate({ to: "/modules/$moduleId/practice", params: { moduleId: data.primaryModuleId } })}>
            Davom etish
          </GradientButton>
        </div>
      </GlassCard>

      <div className="daily-task">
        <div>
          <p className="daily-task__label">Kunlik vazifa</p>
          <strong>5 ta savol</strong>
        </div>
        <span className="daily-task__meter">{progressPercent}%</span>
      </div>

      <div className="result-grid" aria-label="Bugungi natijalar">
        <article className="result-card result-card--level">
          <span>Daraja</span>
          <strong>{level}</strong>
        </article>
        <article className="result-card result-card--xp">
          <span>XP</span>
          <strong>{totalXp}</strong>
        </article>
      </div>

      <section className="module-strip" aria-labelledby="dashboard-modules-title">
        <div className="section-heading">
          <h2 id="dashboard-modules-title">Modullar</h2>
          <button type="button" onClick={() => navigate({ to: "/modules" })}>Barchasi</button>
        </div>
        <div className="module-strip__scroller">
          {data.modules.map((module, index) => (
            <button
              className="dashboard-module-card"
              key={module.id}
              onClick={() => navigate({ to: "/modules/$moduleId", params: { moduleId: module.id } })}
              type="button"
            >
              <span className="dashboard-module-card__mark">{index + 1}</span>
              <strong>{module.title}</strong>
              <small>{module.subtitle}</small>
            </button>
          ))}
        </div>
      </section>
    </section>
  );
}
