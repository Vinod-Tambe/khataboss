import React from "react";
import AccountTable from "./AccountTable";

const TradingAccount = ({ account }) => {
  if (!account) return null;

  return (
    <AccountTable
      title={account.title}
      expenditure={account.expenditure}
      revenue={account.revenue}
    />
  );
};

export default TradingAccount;
