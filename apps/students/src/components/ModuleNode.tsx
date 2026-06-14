export type ModuleNodeStatus = "completed" | "current" | "available" | "locked" | "premium_locked";

type ModuleNodeProps = {
  title: string;
  status: ModuleNodeStatus;
  icon: string;
  description?: string;
  meta?: string;
  onClick?: () => void;
};

const statusLabels: Record<ModuleNodeStatus, string> = {
  completed: "Yakunlandi",
  current: "Hozirgi qadam",
  available: "Ochiq",
  locked: "Yopiq",
  premium_locked: "Premium"
};

const statusIcons: Record<ModuleNodeStatus, string> = {
  completed: "✓",
  current: "",
  available: "",
  locked: "×",
  premium_locked: "★"
};

export function ModuleNode({ title, status, icon, description, meta, onClick }: ModuleNodeProps) {
  const isDisabled = !onClick || status === "locked" || status === "premium_locked";
  const visibleIcon = statusIcons[status] || icon;

  return (
    <article className={`module-path-step module-path-step--${status}`} data-status={status}>
      <button
        type="button"
        className={`module-node module-node--${status}`}
        disabled={isDisabled}
        aria-current={status === "current" ? "step" : undefined}
        aria-label={`${title}: ${statusLabels[status]}`}
        onClick={isDisabled ? undefined : onClick}
      >
        <span className="module-node__icon" aria-hidden="true">{visibleIcon}</span>
      </button>
      <div className="module-path-step__content">
        <div className="module-path-step__header">
          <h3 className="module-path-step__title">{title}</h3>
          <span className={`module-path-step__status module-path-step__status--${status}`}>
            {statusLabels[status]}
          </span>
        </div>
        {description && <p className="module-path-step__description">{description}</p>}
        {meta && <p className="module-path-step__meta">{meta}</p>}
      </div>
    </article>
  );
}
