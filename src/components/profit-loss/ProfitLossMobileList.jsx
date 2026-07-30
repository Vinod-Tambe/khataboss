import React from "react";
import {
  formatCurrency,
  PROFIT_LOSS_ACCOUNTS,
  sumAmounts,
} from "./profitLossData";

const findResultLine = (expenditure = [], revenue = []) => {
  const all = [...expenditure, ...revenue];
  const loss = all.find((r) => /loss/i.test(r.item || ""));
  if (loss) {
    return { label: loss.item, amount: loss.amount, tone: "is-loss" };
  }
  const profit = all.find((r) => /profit/i.test(r.item || ""));
  if (profit) {
    return { label: profit.item, amount: profit.amount, tone: "is-profit" };
  }
  return null;
};

const cellTone = (item = "") => {
  if (/loss/i.test(item)) return "is-loss";
  if (/profit/i.test(item)) return "is-profit";
  return "";
};

const EntryCell = ({ item, amount, empty }) => {
  if (empty) {
    return <div className="profit-loss-mobile-cell is-empty" aria-hidden="true" />;
  }

  return (
    <div className={`profit-loss-mobile-cell ${cellTone(item)}`.trim()}>
      <span className="profit-loss-mobile-cell__name">
        {(item || "").toUpperCase()}
      </span>
      <span className="profit-loss-mobile-cell__amount">
        {formatCurrency(amount)}
      </span>
    </div>
  );
};

const AccountSection = ({ title, expenditure, revenue }) => {
  const maxRows = Math.max(expenditure.length, revenue.length, 1);
  const totalExpenditure = sumAmounts(expenditure);
  const totalRevenue = sumAmounts(revenue);
  const result = findResultLine(expenditure, revenue);

  return (
    <section className="profit-loss-mobile-account">
      <h6 className="profit-loss-mobile-account__title">{title}</h6>

      <div className="profit-loss-mobile-grid-head">
        <div className="profit-loss-mobile-grid-head__col is-expense">
          Expenditure
        </div>
        <div className="profit-loss-mobile-grid-head__col is-income">
          Revenue
        </div>
      </div>

      <div className="profit-loss-mobile-grid-body">
        {Array.from({ length: maxRows }).map((_, index) => {
          const exp = expenditure[index];
          const rev = revenue[index];
          return (
            <div className="profit-loss-mobile-grid-row" key={index}>
              <EntryCell item={exp?.item} amount={exp?.amount} empty={!exp} />
              <EntryCell item={rev?.item} amount={rev?.amount} empty={!rev} />
            </div>
          );
        })}
      </div>

      <div className="profit-loss-mobile-grid-total">
        <div className="profit-loss-mobile-cell is-total is-expense">
          <span className="profit-loss-mobile-cell__name">Total</span>
          <span className="profit-loss-mobile-cell__amount">
            {formatCurrency(totalExpenditure)}
          </span>
        </div>
        <div className="profit-loss-mobile-cell is-total is-income">
          <span className="profit-loss-mobile-cell__name">Total</span>
          <span className="profit-loss-mobile-cell__amount">
            {formatCurrency(totalRevenue)}
          </span>
        </div>
      </div>

      {result ? (
        <div className={`profit-loss-mobile-net ${result.tone}`}>
          <span>
            {result.tone === "is-loss" ? (
              <i className="bi bi-arrow-down-circle-fill me-1" aria-hidden="true" />
            ) : (
              <i className="bi bi-arrow-up-circle-fill me-1" aria-hidden="true" />
            )}
            {(result.label || "").replace(/\s*c\/d|\s*b\/d/gi, "").trim() || result.label}
          </span>
          <span>{formatCurrency(result.amount)}</span>
        </div>
      ) : null}
    </section>
  );
};

const ProfitLossMobileList = ({ accounts = PROFIT_LOSS_ACCOUNTS }) => {
  if (!accounts.length) {
    return (
      <div className="profit-loss-mobile-wrap text-center text-muted py-4">
        No records found for the selected period.
      </div>
    );
  }

  return (
    <div className="profit-loss-mobile-wrap">
      {accounts.map((account) => (
        <AccountSection
          key={account.id}
          title={account.title}
          expenditure={account.expenditure}
          revenue={account.revenue}
        />
      ))}
    </div>
  );
};

export default ProfitLossMobileList;
