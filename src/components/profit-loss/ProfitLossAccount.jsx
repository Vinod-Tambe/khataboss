import React from "react";
import AccountTable from "./AccountTable";

const ProfitLossAccount = ({ account }) => {
  if (!account) return null;

  return (
    <AccountTable
      title={account.title}
      expenditure={account.expenditure}
      revenue={account.revenue}
    />
  );
};

export default ProfitLossAccount;
