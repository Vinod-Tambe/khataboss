import React, { useMemo, useState } from "react";
import DayBookMobileCard from "./DayBookMobileCard";
import DayBookProcessingMobileCard from "./DayBookProcessingMobileCard";
import DayBookFirstMonthInterestMobileCard from "./DayBookFirstMonthInterestMobileCard";
import {
  calculateSectionTotals,
  calculateProcessingSectionTotals,
  calculateFirstMonthInterestSectionTotals,
  formatCurrency,
  isProcessingDaybookSection,
  isFirstMonthInterestDaybookSection,
} from "./dayBookUtils";

const DayBookMobileSection = ({
  title,
  colorClass = "",
  amtTone = "cr",
  data = [],
  expandedCardKey,
  onToggleCard,
  isOpen = true,
  onToggleSection,
}) => {
  const [search, setSearch] = useState("");
  const [totalsOpen, setTotalsOpen] = useState(false);
  const isProcessingSection = isProcessingDaybookSection(title);
  const isFirstMonthInterestSection = isFirstMonthInterestDaybookSection(title);
  const totals = isProcessingSection
    ? calculateProcessingSectionTotals(data)
    : isFirstMonthInterestSection
      ? calculateFirstMonthInterestSectionTotals(data)
      : calculateSectionTotals(data);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter((item) => {
      const name = (item.db_customer_name || "").toLowerCase();
      const firm = (item.db_firm || "").toLowerCase();
      const date = (item.db_date || "").toLowerCase();
      const ref = (item.db_ref_no || "").toLowerCase();
      const type = (item.db_ref_type || "").toLowerCase();
      return (
        name.includes(q) ||
        firm.includes(q) ||
        date.includes(q) ||
        ref.includes(q) ||
        type.includes(q)
      );
    });
  }, [data, search]);

  if (!data.length) return null;

  return (
    <div
      id={`daybook-section-${title.replace(/\s+/g, "-").toLowerCase()}`}
      className={`daybook-mobile-panel ${colorClass} ${isOpen ? "is-open" : "is-collapsed"}`}
    >
      {/* Same collapse header for every section (e.g. LOAN ADDED) */}
      <button
        type="button"
        className="daybook-mobile-panel__collapse-header"
        onClick={onToggleSection}
        aria-expanded={isOpen}
      >
        <span className="daybook-mobile-panel__name">{title}</span>
        <span className="daybook-mobile-panel__header-right">
          <span className="daybook-mobile-panel__count">{data.length}</span>
          <i className={`bi daybook-collapse-icon ${isOpen ? "bi-chevron-up" : "bi-chevron-down"}`} aria-hidden="true"></i>
        </span>
      </button>

      {isOpen && (
        <>
          <div className="daybook-mobile-panel__toolbar daybook-mobile-panel__toolbar--body">
            <input
              type="search"
              className="form-control form-control-sm daybook-mobile-panel__search"
              placeholder="Search name, firm, date, ref"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="daybook-mobile-list">
            {filtered.length > 0 ? (
              filtered.map((item, index) => {
                const cardKey = `${title}-${item.db_user_uuid || index}-${item.db_date || ""}-${index}`;
                if (isProcessingSection) {
                  return (
                    <DayBookProcessingMobileCard
                      key={cardKey}
                      item={item}
                      cardKey={cardKey}
                      expanded={expandedCardKey === cardKey}
                      onToggle={onToggleCard}
                    />
                  );
                }
                if (isFirstMonthInterestSection) {
                  return (
                    <DayBookFirstMonthInterestMobileCard
                      key={cardKey}
                      item={item}
                      cardKey={cardKey}
                      expanded={expandedCardKey === cardKey}
                      onToggle={onToggleCard}
                    />
                  );
                }
                return (
                  <DayBookMobileCard
                    key={cardKey}
                    item={item}
                    cardKey={cardKey}
                    amtTone={amtTone}
                    expanded={expandedCardKey === cardKey}
                    onToggle={onToggleCard}
                  />
                );
              })
            ) : (
              <div className="daybook-mobile-empty">No matching records</div>
            )}
          </div>

          <div className={`daybook-mobile-section__totals ${totalsOpen ? "is-open" : ""}`}>
            <button
              type="button"
              className="daybook-mobile-section__totals-toggle"
              onClick={() => setTotalsOpen((v) => !v)}
              aria-expanded={totalsOpen}
            >
              <span className="daybook-mobile-section__totals-title">
                {title} Total Summary
              </span>
              <span className="daybook-mobile-section__totals-right">
                <strong className={amtTone === "dr" ? "is-dr" : "is-cr"}>
                  {formatCurrency(totals.total)}
                </strong>
                <i className={`bi daybook-collapse-icon ${totalsOpen ? "bi-chevron-up" : "bi-chevron-down"}`} aria-hidden="true"></i>
              </span>
            </button>

            {totalsOpen && (
              <div className="daybook-mobile-totals-grid">
                {isProcessingSection ? (
                  <>
                    <div>
                      <span>Cash</span>
                      <strong className="is-dr">{formatCurrency(totals.cash)}</strong>
                    </div>
                    <div>
                      <span>Bank</span>
                      <strong className="is-dr">{formatCurrency(totals.bank)}</strong>
                    </div>
                    <div>
                      <span>Online</span>
                      <strong className="is-dr">{formatCurrency(totals.online)}</strong>
                    </div>
                    <div>
                      <span>Card</span>
                      <strong className="is-dr">{formatCurrency(totals.card)}</strong>
                    </div>
                    <div>
                      <span>Disc</span>
                      <strong className="is-dr">{formatCurrency(totals.disc)}</strong>
                    </div>
                    <div className="is-full">
                      <span>Total</span>
                      <strong className="is-dr">{formatCurrency(totals.total)}</strong>
                    </div>
                  </>
                ) : isFirstMonthInterestSection ? (
                  <>
                    <div>
                      <span>Cash</span>
                      <strong className="is-dr">{formatCurrency(totals.cash)}</strong>
                    </div>
                    <div>
                      <span>Bank</span>
                      <strong className="is-dr">{formatCurrency(totals.bank)}</strong>
                    </div>
                    <div>
                      <span>Online</span>
                      <strong className="is-dr">{formatCurrency(totals.online)}</strong>
                    </div>
                    <div>
                      <span>Card</span>
                      <strong className="is-dr">{formatCurrency(totals.card)}</strong>
                    </div>
                    <div>
                      <span>Disc</span>
                      <strong className="is-dr">{formatCurrency(totals.disc)}</strong>
                    </div>
                    <div className="is-full">
                      <span>Total</span>
                      <strong className="is-dr">{formatCurrency(totals.total)}</strong>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <span>Cash</span>
                      <strong>{formatCurrency(totals.cash)}</strong>
                    </div>
                    <div>
                      <span>Bank</span>
                      <strong>{formatCurrency(totals.bank)}</strong>
                    </div>
                    <div>
                      <span>Online</span>
                      <strong>{formatCurrency(totals.online)}</strong>
                    </div>
                    <div>
                      <span>Card</span>
                      <strong>{formatCurrency(totals.card)}</strong>
                    </div>
                    <div>
                      <span>Disc</span>
                      <strong>{formatCurrency(totals.disc)}</strong>
                    </div>
                    <div className="is-full">
                      <span>Total</span>
                      <strong className={amtTone === "dr" ? "is-dr" : "is-cr"}>
                        {formatCurrency(totals.total)}
                      </strong>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DayBookMobileSection;
