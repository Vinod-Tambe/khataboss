import React, { useState } from "react";
import { calculateDayBookSummary, formatCurrency } from "./dayBookUtils";

const Line = ({ label, value, tone = "" }) => (
  <div className="daybook-mobile-summary__row">
    <span className="daybook-mobile-summary__label">{label}</span>
    <span className={`daybook-mobile-summary__value ${tone}`.trim()}>
      {formatCurrency(value)}
    </span>
  </div>
);

const ModeBlock = ({ title, modes, tone = "" }) => (
  <div className="daybook-mobile-summary__modes">
    <div className={`daybook-mobile-summary__modes-title ${tone}`.trim()}>{title}</div>
    <div className="daybook-mobile-mode-row">
      <span>Cash</span>
      <span>{formatCurrency(modes.cash)}</span>
    </div>
    <div className="daybook-mobile-mode-row">
      <span>Bank</span>
      <span>{formatCurrency(modes.bank)}</span>
    </div>
    <div className="daybook-mobile-mode-row">
      <span>Online</span>
      <span>{formatCurrency(modes.online)}</span>
    </div>
    <div className="daybook-mobile-mode-row">
      <span>Card</span>
      <span>{formatCurrency(modes.card)}</span>
    </div>
    <div className="daybook-mobile-mode-row">
      <span>Disc</span>
      <span>{formatCurrency(modes.disc)}</span>
    </div>
  </div>
);

const DayBookMobileSummary = ({ DayBookData, opening_data }) => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const summary = calculateDayBookSummary(DayBookData, opening_data);

  return (
    <div className="daybook-mobile-summary">
      <div className="daybook-mobile-summary__title">Summary</div>

      <Line label="Amount In" value={summary.in.total} tone="is-dr" />
      <Line label="Amount Out" value={summary.out.total} tone="is-cr" />
      <Line label="Today Total" value={summary.today.total} />
      <Line label="Opening Balance" value={summary.opening.total} />
      <Line label="Closing Amount" value={summary.closing.total} />

      <button
        type="button"
        className="daybook-mobile-summary__toggle"
        onClick={() => setDetailsOpen((v) => !v)}
        aria-expanded={detailsOpen}
      >
        <span>{detailsOpen ? "Less details" : "More details"}</span>
        <i className={`bi daybook-collapse-icon ${detailsOpen ? "bi-chevron-up" : "bi-chevron-down"}`} aria-hidden="true"></i>
      </button>

      {detailsOpen && (
        <div className="daybook-mobile-summary__details">
          <ModeBlock title="Amount In" modes={summary.in} tone="is-dr" />
          <ModeBlock title="Amount Out" modes={summary.out} tone="is-cr" />
          <ModeBlock title="Today Total" modes={summary.today} />
          <ModeBlock title="Opening" modes={summary.opening} />
          <ModeBlock title="Closing" modes={summary.closing} />
        </div>
      )}

      <div className="daybook-mobile-summary__final">
        <span className="is-cr">CR : {formatCurrency(summary.finalCr)}</span>
        <span className="is-dr">DR : {formatCurrency(summary.finalDr)}</span>
        <span className="is-final">{formatCurrency(summary.finalTotal)}</span>
      </div>
    </div>
  );
};

export default DayBookMobileSummary;
