import React from "react";
import AccountTable from "./AccountTable";
import { getAccountById } from "./profitLossData";

const TradingAccount = () => {
  const account = getAccountById("trading");
  return (
    <AccountTable
      title={account.title}
      expenditure={account.expenditure}
      revenue={account.revenue}
    />
  );
};

export default TradingAccount;
