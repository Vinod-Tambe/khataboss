/** Shared P/L account data — desktop tables and mobile cards stay in sync */

export const formatCurrency = (value) =>
  Number(value || 0).toLocaleString("en-IN");

export const sumAmounts = (rows = []) =>
  rows.reduce((sum, row) => sum + Number(row.amount || 0), 0);

/**
 * Realistic dummy ledgers for Trading / P&L / Capital.
 * Totals on both sides match (balanced T-accounts).
 */
export const PROFIT_LOSS_ACCOUNTS = [
  {
    id: "trading",
    title: "TRADING ACCOUNT",
    expenditure: [
      { item: "Opening Stock", amount: 850000 },
      { item: "Purchases - Gold", amount: 4250000 },
      { item: "Purchases - Silver", amount: 980000 },
      { item: "Wages", amount: 165000 },
      { item: "Freight Inward", amount: 42000 },
      { item: "Gross Profit c/d", amount: 1313000 },
    ],
    revenue: [
      { item: "Sales - Gold", amount: 5200000 },
      { item: "Sales - Silver", amount: 1450000 },
      { item: "Closing Stock", amount: 950000 },
    ],
  },
  {
    id: "profit-loss",
    title: "PROFIT & LOSS",
    expenditure: [
      { item: "Salaries", amount: 320000 },
      { item: "Rent & Taxes", amount: 144000 },
      { item: "Electricity", amount: 38000 },
      { item: "Interest Paid", amount: 95000 },
      { item: "Depreciation", amount: 72000 },
      { item: "Bad Debts", amount: 25000 },
      { item: "Net Profit c/d", amount: 669000 },
    ],
    revenue: [
      { item: "Gross Profit b/d", amount: 1313000 },
      { item: "Discount Received", amount: 28000 },
      { item: "Interest Received", amount: 22000 },
    ],
  },
  {
    id: "capital",
    title: "CAPITAL ACCOUNT",
    expenditure: [
      { item: "Drawings", amount: 180000 },
      { item: "Income Tax", amount: 95000 },
      { item: "Closing Capital", amount: 2894000 },
    ],
    revenue: [
      { item: "Opening Capital", amount: 2500000 },
      { item: "Net Profit b/d", amount: 669000 },
    ],
  },
];

export const getAccountById = (id) =>
  PROFIT_LOSS_ACCOUNTS.find((account) => account.id === id);
