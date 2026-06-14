import { useNavigate } from "@tanstack/react-router";
import { AppBackground, PrimaryGlowButton } from "@burro/ui";
import { useModuleResult, useNextModule } from "../features/learning/hooks";
import "./ModuleCompletedScreen.css";

/**
 * Module completion screen (doc 12 §9.11, ref docs/design/reference-screens/16-module-completed.png).
 * Full-bleed mosque background, centered hero check, "Modul Yakunlandi!" title with
 * motivational subtitle, two stat cards (XP yellow, Aniqlik green), then a cyan
 * "Keyingi modul" CTA and a "Bosh sahifa" secondary text link.
 *
 * Data: /student/modules/:moduleId/result → ModuleResultDto (xpEarned, accuracy,
 * passed, finalQuizBestScore). Next-module lookup walks /student/path.
 */
export function ModuleCompletedScreen({ moduleId }: { moduleId: string }) {
  const navigate = useNavigate();
  const { data: result, isPending, isError } = useModuleResult(moduleId);
  const { data: nextModule } = useNextModule(moduleId);

  const goNext = () => {
    if (nextModule) {
      navigate({ to: "/modules/$moduleId", params: { moduleId: nextModule.id } });
      return;
    }
    navigate({ to: "/modules" });
  };

  const goHome = () => navigate({ to: "/dashboard" });

  const body = (() => {
    if (isPending) {
      return <p className="module-completed-replica-state">Yuklanmoqda...</p>;
    }
    if (isError || !result) {
      return (
        <div className="module-completed-replica-state module-completed-replica-state--error" role="alert">
          <h2>Xatolik</h2>
          <p>Modul natijasini yuklab bo‘lmadi.</p>
          <PrimaryGlowButton type="button" onClick={goHome}>Bosh sahifa</PrimaryGlowButton>
        </div>
      );
    }

    return (
      <>
        <div className="module-completed-replica-hero" aria-hidden="true">
          <span className="module-completed-replica-hero__circle">
            <span className="module-completed-replica-hero__check" />
          </span>
        </div>

        <header className="module-completed-replica-headline">
          <h1>Modul Yakunlandi!</h1>
          <p>Barakalla! Siz ajoyib natija ko‘rsatdingiz.</p>
        </header>

        <section className="module-completed-replica-stats" aria-label="Sizning natijangiz">
          <article className="module-completed-replica-stat module-completed-replica-stat--xp">
            <strong>{result.xpEarned} XP</strong>
            <span>Ball</span>
          </article>
          <article className="module-completed-replica-stat module-completed-replica-stat--accuracy">
            <strong>{result.accuracy}%</strong>
            <span>Aniqlik</span>
          </article>
        </section>

        <div className="module-completed-replica-actions">
          <PrimaryGlowButton type="button" onClick={goNext}>
            Keyingi modul
          </PrimaryGlowButton>
          <button type="button" className="module-completed-replica-secondary" onClick={goHome}>
            Bosh sahifa
          </button>
        </div>
      </>
    );
  })();

  return (
    <div className="module-completed-replica-shell">
      <AppBackground variant="app" overlay="light">
        <section className="module-completed-replica-screen" aria-labelledby="module-completed-title">
          <span id="module-completed-title" className="sr-only">Modul yakunlandi</span>
          {body}
        </section>
      </AppBackground>
    </div>
  );
}
