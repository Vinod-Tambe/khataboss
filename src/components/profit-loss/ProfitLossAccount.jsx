import React from "react";
import AccountTable from "./AccountTable";
import { getAccountById } from "./profitLossData";

const ProfitLossAccount = () => {
  const account = getAccountById("profit-loss");
  return (
    <AccountTable
      title={account.title}
      expenditure={account.expenditure}
      revenue={account.revenue}
    />
  );
};

export default ProfitLossAccount;
