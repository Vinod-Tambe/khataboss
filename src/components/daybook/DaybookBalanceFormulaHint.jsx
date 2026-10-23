import React from "react";

/**
 * Hover/focus tooltip showing how an opening or closing balance was calculated.
 */
const DaybookBalanceFormulaHint = ({ formula, className, children }) => {
  if (!formula) {
    return children;
  }

  const titleFallback = formula.replace(/\n/g, " · ");

  return (
    <span
      className={`daybook-balance-formula-hint ${className || ""}`.trim()}
      title={titleFallback}
      tabIndex={0}
    >
      {children}
      <span className="daybook-balance-formula-hint__popup" role="tooltip">
        {formula}
      </span>
    </span>
  );
};

export default DaybookBalanceFormulaHint;
