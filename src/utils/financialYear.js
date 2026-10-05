import moment from 'moment';

export function getFinancialYearMoments(reference = moment()) {
  const m = moment(reference);
  const currentYear = m.year();
  const isAfterMarch = m.month() >= 3;
  const fyStart = isAfterMarch
    ? moment(`${currentYear}-04-01`)
    : moment(`${currentYear - 1}-04-01`);
  const fyEnd = isAfterMarch
    ? moment(`${currentYear + 1}-03-31`)
    : moment(`${currentYear}-03-31`);
  return { fyStart, fyEnd };
}

export function getDefaultFinancialYearStrings() {
  const { fyStart, fyEnd } = getFinancialYearMoments();
  return {
    startDate: fyStart.format('YYYY-MM-DD'),
    endDate: fyEnd.format('YYYY-MM-DD'),
  };
}

export function getAssessmentYearLabel(endDate) {
  const end = moment(endDate);
  if (!end.isValid()) return '-';
  return end.month() >= 3
    ? `${end.year()} - ${end.year() + 1}`
    : `${end.year() - 1} - ${end.year()}`;
}

/** Indian FY key e.g. "2026-2027" (Apr 2026 – Mar 2027). */
export function getFinancialYearKeyFromStart(fyStartYear) {
  const y = Number(fyStartYear);
  return `${y}-${y + 1}`;
}

export function getCurrentFinancialYearKey() {
  const { fyStart } = getFinancialYearMoments();
  return getFinancialYearKeyFromStart(fyStart.year());
}

/** Calendar month 1–12 for month filter dropdown (January = "1"). */
export function getCurrentCalendarMonthFilterValue() {
  return String(moment().month() + 1);
}

export function parseFinancialYearKey(key) {
  const match = String(key || '').match(/^(\d{4})-(\d{4})$/);
  if (!match) return null;
  const startYear = parseInt(match[1], 10);
  const endYear = parseInt(match[2], 10);
  if (endYear !== startYear + 1) return null;
  return {
    key: `${startYear}-${endYear}`,
    label: `${startYear}-${endYear}`,
    startDate: `${startYear}-04-01`,
    endDate: `${endYear}-03-31`,
  };
}

/** Financial year dropdown options (newest first). */
export function getFinancialYearOptions(yearsBack = 6, yearsForward = 0) {
  const { fyStart } = getFinancialYearMoments();
  const baseYear = fyStart.year();
  const options = [];
  for (let offset = -yearsForward; offset <= yearsBack; offset += 1) {
    const y = baseYear - offset;
    const parsed = parseFinancialYearKey(getFinancialYearKeyFromStart(y));
    if (parsed) options.push(parsed);
  }
  return options;
}

export const CALENDAR_MONTH_FILTERS = [
  { value: 'all', label: 'All months (full year)' },
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

/**
 * Clip a calendar month to the selected financial year range.
 * @param {string} fyStartDate YYYY-MM-DD (Apr 1)
 * @param {string} fyEndDate YYYY-MM-DD (Mar 31)
 * @param {string} monthValue 'all' or '1'..'12'
 */
export function resolveMonthWithinFinancialYear(fyStartDate, fyEndDate, monthValue) {
  if (!monthValue || monthValue === 'all') {
    return { startDate: fyStartDate, endDate: fyEndDate };
  }
  const monthNum = parseInt(monthValue, 10);
  if (!monthNum || monthNum < 1 || monthNum > 12) {
    return { startDate: fyStartDate, endDate: fyEndDate };
  }

  const fyStart = moment(fyStartDate);
  const fyEnd = moment(fyEndDate);
  const years = [fyStart.year(), fyEnd.year()];

  for (let i = 0; i < years.length; i += 1) {
    const year = years[i];
    const monthStart = moment({ year, month: monthNum - 1, date: 1 });
    const monthEnd = monthStart.clone().endOf('month');
    const overlapStart = moment.max(monthStart, fyStart);
    const overlapEnd = moment.min(monthEnd, fyEnd);
    if (overlapStart.isSameOrBefore(overlapEnd, 'day')) {
      return {
        startDate: overlapStart.format('YYYY-MM-DD'),
        endDate: overlapEnd.format('YYYY-MM-DD'),
      };
    }
  }

  return { startDate: fyStartDate, endDate: fyEndDate };
}

export function resolveLoanStockLedgerPeriod(financialYearKey, monthValue) {
  const fy = parseFinancialYearKey(financialYearKey);
  if (!fy) {
    const def = getDefaultFinancialYearStrings();
    return { ...def, financialYearKey: getCurrentFinancialYearKey(), monthValue: 'all' };
  }
  const period = resolveMonthWithinFinancialYear(fy.startDate, fy.endDate, monthValue);
  return {
    ...period,
    financialYearKey: fy.key,
    monthValue: monthValue || 'all',
  };
}
