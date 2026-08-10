/** Shared P/L helpers — desktop tables, mobile cards, and PDF stay in sync */

export const formatCurrency = (value) =>
  Number(value || 0).toLocaleString("en-IN");

export const sumAmounts = (rows = []) =>
  rows.reduce((sum, row) => sum + Number(row.amount || 0), 0);

const pushIfAmount = (list, item, amount) => {
  const value = Number(amount || 0);
  if (!value) return;
  list.push({ item, amount: value });
};

/**
 * Map API profit-loss payload into balanced T-account sections
 * used by desktop tables, mobile list, and PDF.
 */
export const buildProfitLossAccounts = (apiData) => {
  if (!apiData) return [];

  const trading = apiData.tradingAccount || {};
  const pnl = apiData.profitLossAccount || {};
  const capital = apiData.capitalAccount || {};

  const tradingExpenditure = [...(trading.expenditure || [])];
  const tradingRevenue = [...(trading.revenue || [])];
  if (Number(trading.grossProfit) > 0) {
    tradingExpenditure.push({
      item: "Gross Profit c/d",
      amount: Number(trading.grossProfit),
    });
  }
  if (Number(trading.grossLoss) > 0) {
    tradingRevenue.push({
      item: "Gross Loss c/d",
      amount: Number(trading.grossLoss),
    });
  }

  const pnlExpenditure = [];
  const pnlRevenue = [];
  if (Number(trading.grossLoss) > 0) {
    pnlExpenditure.push({
      item: "Gross Loss b/d",
      amount: Number(trading.grossLoss),
    });
  }
  pnlExpenditure.push(...(pnl.expenditure || []));
  if (Number(trading.grossProfit) > 0) {
    pnlRevenue.push({
      item: "Gross Profit b/d",
      amount: Number(trading.grossProfit),
    });
  }
  pnlRevenue.push(...(pnl.revenue || []));
  if (Number(pnl.netProfit) > 0) {
    pnlExpenditure.push({
      item: "Net Profit c/d",
      amount: Number(pnl.netProfit),
    });
  }
  if (Number(pnl.netLoss) > 0) {
    pnlRevenue.push({
      item: "Net Loss c/d",
      amount: Number(pnl.netLoss),
    });
  }

  const capitalExpenditure = [];
  const capitalRevenue = [];
  pushIfAmount(capitalRevenue, "Opening Capital", capital.openingCapital);
  pushIfAmount(capitalRevenue, "Additions", capital.additions);
  if (Number(capital.netProfit) > 0) {
    capitalRevenue.push({
      item: "Net Profit b/d",
      amount: Number(capital.netProfit),
    });
  }
  pushIfAmount(capitalExpenditure, "Drawings", capital.drawings);
  if (Number(capital.netLoss) > 0) {
    capitalExpenditure.push({
      item: "Net Loss b/d",
      amount: Number(capital.netLoss),
    });
  }
  capitalExpenditure.push({
    item: "Closing Capital",
    amount: Number(capital.closingCapital || 0),
  });

  return [
    {
      id: "trading",
      title: "TRADING ACCOUNT",
      expenditure: tradingExpenditure,
      revenue: tradingRevenue,
    },
    {
      id: "profit-loss",
      title: "PROFIT & LOSS",
      expenditure: pnlExpenditure,
      revenue: pnlRevenue,
    },
    {
      id: "capital",
      title: "CAPITAL ACCOUNT",
      expenditure: capitalExpenditure,
      revenue: capitalRevenue,
    },
  ];
};

export const getAccountById = (accounts, id) =>
  (accounts || []).find((account) => account.id === id);
