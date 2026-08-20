import React from "react";

const RecordNavButtons = ({
  hasPrev = false,
  hasNext = false,
  onPrev,
  onNext,
  positionLabel = null,
  size = "sm",
  variant = "default",
  className = "",
  disabled = false,
}) => {
  const isPanel = variant === "panel";
  const rootClass = [
    "record-nav-buttons",
    "d-inline-flex",
    "align-items-center",
    isPanel ? "record-nav-buttons--panel" : "gap-1",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const prevBtnClass = [
    "btn",
    isPanel ? "btn-outline-danger" : "btn-outline-secondary",
    `btn-${size}`,
    "record-nav-buttons__btn",
    isPanel ? "shadow-sm record-nav-buttons__btn--prev" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const nextBtnClass = [
    "btn",
    isPanel ? "btn-outline-success" : "btn-outline-secondary",
    `btn-${size}`,
    "record-nav-buttons__btn",
    isPanel ? "shadow-sm record-nav-buttons__btn--next" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const prevIcon = isPanel ? "bi bi-arrow-left-circle fs-6" : "bi bi-chevron-left";
  const nextIcon = isPanel ? "bi bi-arrow-right-circle fs-6" : "bi bi-chevron-right";

  return (
    <div className={rootClass}>
      {positionLabel ? (
        <span className="record-nav-buttons__count text-muted small fw-semibold">
          {positionLabel}
        </span>
      ) : null}
      <button
        type="button"
        className={prevBtnClass}
        disabled={disabled || !hasPrev}
        onClick={onPrev}
        title="Previous record"
        aria-label="Previous record"
      >
        <i className={prevIcon} aria-hidden="true" />
      </button>
      <button
        type="button"
        className={nextBtnClass}
        disabled={disabled || !hasNext}
        onClick={onNext}
        title="Next record"
        aria-label="Next record"
      >
        <i className={nextIcon} aria-hidden="true" />
      </button>
    </div>
  );
};

export default RecordNavButtons;
