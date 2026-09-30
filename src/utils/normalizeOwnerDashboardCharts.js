const LOAN_PIE_LABELS = [
  'Active Loans',
  'Auction Loans',
  'Release Loans',
  'Transfer Loans',
];

const FINANCE_PIE_LABELS = ['Active Finance', 'Close Finance'];

function mapLegacyLoanPeriod(periodBlock) {
  if (!periodBlock) return { categories: [], counts: [] };
  const categories = periodBlock.categories || [];
  const counts = periodBlock.loans ?? periodBlock.counts ?? [];
  return { categories, counts };
}

function mapLegacyFinancePeriod(periodBlock) {
  if (!periodBlock) return { categories: [], counts: [] };
  const categories = periodBlock.categories || [];
  const counts = periodBlock.finance ?? periodBlock.counts ?? [];
  return { categories, counts };
}

function buildLegacyLoanAudit(cards) {
  const total = Number(cards?.totalLoan) || 0;
  return {
    total,
    active: total,
    auction: 0,
    released: 0,
    transfer: 0,
    closed: 0,
    labels: LOAN_PIE_LABELS,
    series: [total, 0, 0, 0],
  };
}

function buildLegacyFinanceAudit(cards) {
  const total = Number(cards?.totalFinance) || 0;
  return {
    total,
    active: total,
    closed: 0,
    labels: FINANCE_PIE_LABELS,
    series: [total, 0],
  };
}

/**
 * Owner home charts: new API uses loanAudit / loanLast.
 * Older backends returned charts.counts (weekly/monthly/yearly loans + finance arrays).
 */
export function normalizeOwnerDashboardCharts(charts, cards) {
  if (!charts || typeof charts !== 'object') return {};

  if (charts.loanAudit || charts.loanLast) {
    return charts;
  }

  const counts = charts.counts || {};

  return {
    ...charts,
    loanAudit: buildLegacyLoanAudit(cards),
    loanLast: {
      day: mapLegacyLoanPeriod(counts.weekly),
      month: mapLegacyLoanPeriod(counts.monthly),
      year: mapLegacyLoanPeriod(counts.yearly),
    },
    financeAudit: buildLegacyFinanceAudit(cards),
    financeLast: {
      day: mapLegacyFinancePeriod(counts.weekly),
      month: mapLegacyFinancePeriod(counts.monthly),
      year: mapLegacyFinancePeriod(counts.yearly),
    },
  };
}
