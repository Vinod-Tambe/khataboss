import React from "react";
import AccountTable from "./AccountTable";
import { getAccountById } from "./profitLossData";

const CapitalAccount = () => {
  const account = getAccountById("capital");
  return (
    <AccountTable
      title={account.title}
      expenditure={account.expenditure}
      revenue={account.revenue}
    />
  );
};

export default CapitalAccount;
