import React from "react";
import BalanceSheetMobileCard from "./BalanceSheetMobileCard";
import { formatCurrency } from "./balanceSheetUtils";

const TotalRow = ({ label, value, tone = "" }) => (
  <div className="balance-sheet-mobile-row">
    <span className="balance-sheet-mobile-row__label">{label}</span>
    <span className={`balance-sheet-mobile-row__value ${tone}`.trim()}>
      {value}
    </span>
  </div>
);

const Section = ({ title, items, balancedTotal, netLabel, netAmount, netTone }) => (
  <div className="balance-sheet-mobile-section">
    <div className="balance-sheet-mobile-section__title">
      <span>{title}</span>
      <span className="balance-sheet-mobile-section__count">{items.length}</span>
    </div>
    <div className="balance-sheet-mobile-section__list">
      {items.length > 0 ? (
        items.map((item, idx) => (
          <BalanceSheetMobileCard
            key={`${title}-${item.name}-${idx}`}
            name={item.name}
            value={item.value}
          />
        ))
      ) : (
        <div className="balance-sheet-mobile-empty text-muted">No {title.toLowerCase()} entries</div>
      )}

      {netLabel ? (
        <div className={`balance-sheet-mobile-row-item balance-sheet-mobile-row-item--net ${netTone}`}>
          <span className="balance-sheet-mobile-card__name">{netLabel}</span>
          <span className="balance-sheet-mobile-row__value">{formatCurrency(netAmount)}</span>
        </div>
      ) : null}

      <div className="balance-sheet-mobile-section__total">
        <span>Total</span>
        <span>{formatCurrency(balancedTotal)}</span>
      </div>
    </div>
  </div>
);

const BalanceSheetMobileList = ({
  assetList = [],
  liabilityList = [],
  totalAssets = 0,
  totalLiabilities = 0,
  diffBalance = 0,
  balancedTotal = 0,
}) => {
  if (!assetList.length && !liabilityList.length) {
    return (
      <div className="balance-sheet-mobile-wrap text-center text-muted py-4">
        No records found for the selected period.
      </div>
    );
  }

  const showProfit = diffBalance > 0;
  const showLoss = diffBalance < 0;

  return (
    <div className="balance-sheet-mobile-wrap">
      <Section
        title="Liabilities"
        items={liabilityList}
        balancedTotal={balancedTotal}
        netLabel={showProfit ? "NET PROFIT" : null}
        netAmount={showProfit ? diffBalance : 0}
        netTone="is-profit"
      />
      <Section
        title="Assets"
        items={assetList}
        balancedTotal={balancedTotal}
        netLabel={showLoss ? "NET LOSS" : null}
        netAmount={showLoss ? Math.abs(diffBalance) : 0}
        netTone="is-loss"
      />

      <div className="balance-sheet-mobile-totals">
        <div className="balance-sheet-mobile-totals__title">Summary</div>
        <TotalRow label="Total Liabilities" value={formatCurrency(totalLiabilities)} />
        <TotalRow label="Total Assets" value={formatCurrency(totalAssets)} />
        {diffBalance !== 0 && (
          <TotalRow
            label={diffBalance > 0 ? "Net Profit" : "Net Loss"}
            value={formatCurrency(Math.abs(diffBalance))}
            tone={diffBalance > 0 ? "balance-sheet-amt-profit" : "balance-sheet-amt-loss"}
          />
        )}
        <TotalRow label="Balance Total" value={formatCurrency(balancedTotal)} />
      </div>
    </div>
  );
};

export default BalanceSheetMobileList;
