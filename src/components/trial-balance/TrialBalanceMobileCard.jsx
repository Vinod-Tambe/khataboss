import React from "react";
import { Link } from "react-router-dom";
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

const BalanceRow = ({ label, value, tone = "zero" }) => (
  <div className="trial-balance-mobile-row">
    <span className="trial-balance-mobile-row__label">{label}</span>
    <span className={`trial-balance-mobile-row__value ${toneClass[tone]}`}>
      {value}
    </span>
  </div>
);

const TrialBalanceMobileCard = ({ item }) => {
  const accountCode = item.acc_code || item.acc_no || item.account_code;
  const openBal = item.acc_open_balance || 0;
  const closeBal = item.acc_close_balance || 0;
  const debit = item.total_dr_amt || 0;
  const credit = item.total_cr_amt || 0;

  return (
    <div className="trial-balance-mobile-card">
      <div>
        <Link
          to={`/account/details/${item.acc_uuid}`}
          className="text-decoration-none trial-balance-mobile-card__name"
        >
          {item.acc_name}
        </Link>
        {accountCode ? (
          <div className="trial-balance-mobile-card__code">{accountCode}</div>
        ) : null}
      </div>

      <BalanceRow
        label="Opening Balance"
        value={formatSignedBalance(openBal)}
        tone={getBalanceTone(openBal)}
      />
      <BalanceRow
        label="Debit"
        value={formatCurrency(debit)}
        tone={debit ? "dr" : "zero"}
      />
      <BalanceRow
        label="Credit"
        value={formatCurrency(credit)}
        tone={credit ? "cr" : "zero"}
      />
      <BalanceRow
        label="Closing Balance"
        value={formatSignedBalance(closeBal)}
        tone={getBalanceTone(closeBal)}
      />
    </div>
  );
};

export default TrialBalanceMobileCard;
