import React from "react";
import { formatCurrency } from "./balanceSheetUtils";

const BalanceSheetMobileCard = ({ name, value }) => (
  <div className="balance-sheet-mobile-row-item">
    <span className="balance-sheet-mobile-card__name">{(name || "").toUpperCase()}</span>
    <span className="balance-sheet-mobile-row__value">{formatCurrency(value)}</span>
  </div>
);

export default BalanceSheetMobileCard;
