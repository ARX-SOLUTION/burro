import { useNavigate } from "@tanstack/react-router";
import { AppBackground, PrimaryGlowButton } from "@burro/ui";
import { useModuleResult, useNextModule } from "../features/learning/hooks";

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
      return <p className="module-completed-screen__state">Yuklanmoqda...</p>;
    }
    if (isError || !result) {
      return (
        <div className="module-completed-screen__state module-completed-screen__state--error" role="alert">
          <h2>Xatolik</h2>
          <p>Modul natijasini yuklab bo‘lmadi.</p>
          <PrimaryGlowButton type="button" onClick={goHome}>Bosh sahifa</PrimaryGlowButton>
        </div>
      );
    }

    return (
      <>
        <div className="module-completed-hero" aria-hidden="true">
          <span className="module-completed-hero__circle">
            <span className="module-completed-hero__check" />
          </span>
        </div>

        <header className="module-completed-headline">
          <h1>Modul Yakunlandi!</h1>
          <p>Barakalla! Siz ajoyib natija ko‘rsatdingiz.</p>
        </header>

        <section className="module-completed-stats" aria-label="Sizning natijangiz">
          <article className="module-completed-stat module-completed-stat--xp">
            <strong>{result.xpEarned} XP</strong>
            <span>Ball</span>
          </article>
          <article className="module-completed-stat module-completed-stat--accuracy">
            <strong>{result.accuracy}%</strong>
            <span>Aniqlik</span>
          </article>
        </section>

        <div className="module-completed-actions">
          <PrimaryGlowButton type="button" onClick={goNext}>
            {nextModule ? "Keyingi modul" : "Modullarga qaytish"}
          </PrimaryGlowButton>
          <button type="button" className="module-completed-secondary" onClick={goHome}>
            Bosh sahifa
          </button>
        </div>
      </>
    );
  })();

  return (
    <div className="module-completed-shell">
      <AppBackground variant="app">
        <section className="module-completed-screen" aria-labelledby="module-completed-title">
          <span id="module-completed-title" className="sr-only">Modul yakunlandi</span>
          {body}
        </section>
      </AppBackground>
    </div>
  );
}
