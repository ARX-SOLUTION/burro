import { useNavigate } from "@tanstack/react-router";
import { GlassCard, PrimaryGlowButton, ProgressHeader } from "@burro/ui";
import { ModuleNode, type ModuleNodeStatus } from "../components";
import { useStudentModules } from "../features/modules/hooks";
import type { ModuleCardDto, ModuleStatus } from "../features/modules/mock";

type ModulePathStep = {
  id: string;
  title: string;
  description: string;
  icon: string;
  threshold: number;
  action: "practice" | "quiz" | null;
};

const statusCopy: Record<ModuleStatus, { label: string; description: string }> = {
  completed: {
    label: "Yakunlangan",
    description: "Bu modul yakunlangan. Xohlasangiz mashqlarni qayta mustahkamlashingiz mumkin."
  },
  current: {
    label: "Davom etmoqda",
    description: "Bu sizning hozirgi modulingiz. Mashqni davom ettiring va final quizga tayyorlaning."
  },
  available: {
    label: "Ochiq",
    description: "Bu modul boshlashga tayyor. Avval mashq qiling, keyin final quizni ishlang."
  },
  locked: {
    label: "Yopiq",
    description: "Bu modul hali ochilmagan. Oldingi modullarni yakunlaganingizdan keyin boshlanadi."
  },
  premium_locked: {
    label: "Premium",
    description: "Bu modul premium rejada ochiladi. Progress saqlanadi, kirish huquqi esa premiumga bog'liq."
  }
};

const pathSteps: ModulePathStep[] = [
  {
    id: "intro",
    title: "Tovush bilan tanishish",
    description: "Harf va tovushni eslab oling.",
    icon: "ا",
    threshold: 0,
    action: "practice"
  },
  {
    id: "recognition",
    title: "Harfni topish",
    description: "Ko'rgan harfingizni to'g'ri javob bilan bog'lang.",
    icon: "ب",
    threshold: 35,
    action: "practice"
  },
  {
    id: "listening",
    title: "Tinglab tanlash",
    description: "Tovushni eshiting va mos harfni tanlang.",
    icon: "ت",
    threshold: 70,
    action: "practice"
  },
  {
    id: "final-quiz",
    title: "Final quiz",
    description: "Modulni yakunlash uchun bilimni tekshiring.",
    icon: "★",
    threshold: 90,
    action: "quiz"
  }
];

function clampProgress(progressPercent: number) {
  return Math.max(0, Math.min(100, Math.round(progressPercent)));
}

function isBlocked(status: ModuleStatus) {
  return status === "locked" || status === "premium_locked";
}

function getStepStatus(module: ModuleCardDto, step: ModulePathStep, index: number): ModuleNodeStatus {
  if (isBlocked(module.status)) {
    return module.status;
  }

  if (module.status === "completed" || module.progressPercent >= 100) {
    return "completed";
  }

  const progress = clampProgress(module.progressPercent);
  const nextStep = pathSteps[index + 1];

  if (nextStep && progress >= nextStep.threshold) {
    return "completed";
  }

  if (module.status === "current" && progress >= step.threshold) {
    return "current";
  }

  return "available";
}

function getStepMeta(module: ModuleCardDto, step: ModulePathStep, status: ModuleNodeStatus) {
  if (status === "completed") {
    return "Tayyor";
  }

  if (status === "current") {
    return `${clampProgress(module.progressPercent)}% bajarildi`;
  }

  if (status === "premium_locked") {
    return "Premium kerak";
  }

  if (status === "locked") {
    return "Avval oldingi modulni yakunlang";
  }

  return step.action === "quiz" ? "Final quiz ochiq" : "Mashq qilish mumkin";
}

export function ModulePathScreen({ moduleId }: { moduleId: string }) {
  const navigate = useNavigate();
  const { data: modules, isPending, isError } = useStudentModules();

  if (isPending) {
    return <GlassCard><p>Modul yuklanmoqda...</p></GlassCard>;
  }

  if (isError || !modules) {
    return <GlassCard><h2>Xatolik</h2><p>Modul ma'lumotini yuklab bo'lmadi.</p></GlassCard>;
  }

  const module = modules.find((candidate) => candidate.id === moduleId);

  if (!module) {
    return (
      <section className="module-path module-path--missing" aria-labelledby="module-not-found-title">
        <GlassCard>
          <div className="module-path-error">
            <p className="module-path-error__eyebrow">Modul topilmadi</p>
            <h2 id="module-not-found-title">Noma'lum modul</h2>
            <p className="module-path-error__description">
              "{moduleId}" identifikatori bo'yicha modul topilmadi. Modullar ro'yxatiga qaytib, mavjud modulni tanlang.
            </p>
            <PrimaryGlowButton type="button" onClick={() => navigate({ to: "/modules" })}>
              Modullarga qaytish
            </PrimaryGlowButton>
          </div>
        </GlassCard>
      </section>
    );
  }

  const progress = clampProgress(module.progressPercent);
  const currentStatus = statusCopy[module.status];
  const canStart = !isBlocked(module.status);
  const estimatedTime = module.estimatedMinutes ? `${module.estimatedMinutes} daqiqa` : "Vaqt belgilanmagan";
  const startPractice = () => navigate({ to: "/modules/$moduleId/practice", params: { moduleId: module.id } });
  const startQuiz = () => navigate({ to: "/modules/$moduleId/quiz", params: { moduleId: module.id } });

  return (
    <section className={`module-path module-path--${module.status}`} data-module-status={module.status}>
      <ProgressHeader title={`Modul ${module.sequenceNo}`} progress={`${progress}%`} />

      <GlassCard>
        <div className="module-path-summary">
          <div className="module-path-summary__header">
            <div>
              <p className="module-path-summary__eyebrow">Daraja {module.sequenceNo}</p>
              <h2 className="module-path-summary__title">{module.title}</h2>
            </div>
            <span className={`module-path-status module-path-status--${module.status}`}>
              {currentStatus.label}
            </span>
          </div>

          <p className="module-path-summary__description">{module.description}</p>

          <dl className="module-path-meta">
            <div className="module-path-meta__item">
              <dt>Progress</dt>
              <dd>{progress}%</dd>
            </div>
            <div className="module-path-meta__item">
              <dt>Taxminiy vaqt</dt>
              <dd>{estimatedTime}</dd>
            </div>
            <div className="module-path-meta__item">
              <dt>Kirish</dt>
              <dd>{module.premiumRequired ? "Premium modul" : "Bepul modul"}</dd>
            </div>
          </dl>

          <p className="module-path-state-copy">{currentStatus.description}</p>
        </div>
      </GlassCard>

      <div className="module-path-steps" aria-label={`${module.title} qadamlar yo'li`}>
        {pathSteps.map((step, index) => {
          const status = getStepStatus(module, step, index);
          const isStepBlocked = status === "locked" || status === "premium_locked";
          const handleStepClick = step.action === "quiz" ? startQuiz : startPractice;

          return (
            <ModuleNode
              key={step.id}
              title={step.title}
              description={step.description}
              icon={step.icon}
              status={status}
              meta={getStepMeta(module, step, status)}
              onClick={isStepBlocked ? undefined : handleStepClick}
            />
          );
        })}
      </div>

      <GlassCard>
        <div className="module-path-actions" aria-label="Modul amallari">
          <PrimaryGlowButton
            type="button"
            className="module-path-actions__button module-path-actions__button--practice"
            disabled={!canStart}
            aria-disabled={!canStart}
            onClick={canStart ? startPractice : undefined}
          >
            {module.status === "completed" ? "Mashqni qayta ishlash" : "Mashqni boshlash"}
          </PrimaryGlowButton>
          <PrimaryGlowButton
            type="button"
            className="module-path-actions__button module-path-actions__button--quiz"
            disabled={!canStart}
            aria-disabled={!canStart}
            onClick={canStart ? startQuiz : undefined}
          >
            Final quiz
          </PrimaryGlowButton>
          {!canStart && (
            <p className="module-path-actions__locked-copy">
              {module.status === "premium_locked"
                ? "Premium ochilmaguncha mashq va final quiz boshlanmaydi."
                : "Modul ochilmaguncha mashq va final quiz boshlanmaydi."}
            </p>
          )}
        </div>
      </GlassCard>
    </section>
  );
}
