import React from "react";
import TrialBalanceMobileCard from "./TrialBalanceMobileCard";
import {
  formatCurrency,
  formatSignedBalance,
  getBalanceTone,
} from "./trialBalanceUtils";

const toneClass = {
  dr: "trial-balance-amt-dr",
  cr: "trial-balance-amt-cr",
  zero: "trial-balance-amt-zero",
};

const TotalRow = ({ label, value, tone = "zero" }) => (
  <div className="trial-balance-mobile-row">
    <span className="trial-balance-mobile-row__label">{label}</span>
    <span className={`trial-balance-mobile-row__value ${toneClass[tone]}`}>
      {value}
    </span>
  </div>
);

const TrialBalanceMobileList = ({ data = [], totals }) => {
  if (!data.length) {
    return (
      <div className="trial-balance-mobile-wrap text-center text-muted py-4">
        No records found for the selected period.
      </div>
    );
  }

  return (
    <div className="trial-balance-mobile-wrap">
      {data.map((item) => (
        <TrialBalanceMobileCard key={item.acc_id} item={item} />
      ))}

      <div className="trial-balance-mobile-totals">
        <div className="trial-balance-mobile-totals__title">Totals</div>
        <TotalRow
          label="Opening Balance"
          value={formatSignedBalance(totals.open)}
          tone={getBalanceTone(totals.open)}
        />
        <TotalRow
          label="Total Debit"
          value={formatCurrency(totals.dr)}
          tone="dr"
        />
        <TotalRow
          label="Total Credit"
          value={formatCurrency(totals.cr)}
          tone="cr"
        />
        <TotalRow
          label="Closing Balance"
          value={formatSignedBalance(totals.close)}
          tone={getBalanceTone(totals.close)}
        />
      </div>
    </div>
  );
};

export default TrialBalanceMobileList;
