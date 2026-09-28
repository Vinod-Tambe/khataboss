import React from "react";
import {
  formatCurrency,
  getInterAccountTransferRowAmount,
} from "./dayBookUtils";

const DayBookInterAccountTransferMobileCard = ({ item, cardKey, expanded, onToggle }) => {
  const amount = getInterAccountTransferRowAmount(item);
  const lines = item.db_to_lines;

  return (
    <div className={`daybook-mobile-row ${expanded ? "is-open" : ""}`}>
      <div className="daybook-mobile-row__main">
        <div className="daybook-mobile-row__left">
          <span className="daybook-mobile-row__name text-brown fw-bold">
            {item.db_from_account || "-"}
          </span>
          <button
            type="button"
            className="daybook-mobile-row__meta-btn"
            onClick={() => onToggle(cardKey)}
          >
            {item.db_date || "-"} · {item.db_firm || "-"} · {item.db_direction || "-"}
          </button>
        </div>
        <button
          type="button"
          className="daybook-mobile-row__right"
          onClick={() => onToggle(cardKey)}
          aria-expanded={expanded}
          aria-label={expanded ? "Hide transfer details" : "Show transfer details"}
        >
          <span className="daybook-mobile-row__total is-dr">{formatCurrency(amount)}</span>
          <i
            className={`bi daybook-collapse-icon ${expanded ? "bi-chevron-up" : "bi-chevron-down"}`}
            aria-hidden="true"
          />
        </button>
      </div>

      {expanded && (
        <div className="daybook-mobile-row__details">
          <div className="daybook-mobile-totals-grid daybook-mobile-totals-grid--compact">
            <div className="is-full">
              <span>To account(s)</span>
              {Array.isArray(lines) && lines.length > 1 ? (
                <ul className="mb-0 ps-3 small">
                  {lines.map((line, idx) => (
                    <li key={`${line.account}-${idx}`}>
                      {line.account}: {formatCurrency(line.amount)}
                      {line.remarks ? ` (${line.remarks})` : ""}
                    </li>
                  ))}
                </ul>
              ) : (
                <strong>{item.db_to_description || "-"}</strong>
              )}
            </div>
            <div className="is-full">
              <span>Narration</span>
              <strong>{item.db_narration || "-"}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DayBookInterAccountTransferMobileCard;
