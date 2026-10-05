/** Display amount in daily rows; zero shows as dash. */
export function formatLoanStockLedgerCellAmt(value) {
  const n = Number(value) || 0;
  if (n === 0) return '-';
  return n.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Footer / totals — always show numeric amount (including 0.00). */
export function formatLoanStockLedgerTotalAmt(value) {
  return Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatLoanStockLedgerGirvi(value) {
  const n = Number(value) || 0;
  return n > 0 ? String(n) : '-';
}
