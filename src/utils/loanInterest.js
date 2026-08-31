import moment from 'moment';

/** Normalize FE/DB ROI type values to Prisma enum: monthly | annually */
export const normalizeRoiType = (roiType) => {
  const t = String(roiType || 'monthly').toLowerCase();
  if (t === 'annual' || t === 'annually' || t === 'yearly') return 'annually';
  return 'monthly';
};

/** Convert stored ROI to monthly rate used by interest formulas */
export const getMonthlyRate = (roi, roiType = 'monthly') => {
  const rate = parseFloat(roi) || 0;
  return normalizeRoiType(roiType) === 'annually' ? rate / 12 : rate;
};

/**
 * Accrued interest for a principal over `months` tenure (whole months).
 * Each calendar month or part thereof = 1 full month charge.
 */
export const calculateInterest = (
  principal,
  rate,
  months,
  method = 'simple',
  freq = 'monthly',
  roiType = 'monthly'
) => {
  const p = parseFloat(principal) || 0;
  const monthlyRate = getMonthlyRate(rate, roiType);
  const m = Math.max(0, Math.round(parseFloat(months) || 0));
  if (!p || !monthlyRate || !m) return 0;

  if (method === 'compound') {
    const f = String(freq || 'monthly').toLowerCase();
    let n = 1;
    if (f.includes('quarter')) n = 1 / 3;
    else if (f.includes('half')) n = 1 / 6;
    else if (f.includes('year') || f.includes('annual')) n = 1 / 12;
    else n = 1;

    const periods = m * n;
    const ratePerPeriod = monthlyRate / n;
    const amount = p * Math.pow(1 + ratePerPeriod / 100, periods);
    return parseFloat((amount - p).toFixed(2));
  }

  return parseFloat(((p * monthlyRate * m) / 100).toFixed(2));
};

export const calculateFirstMonthInterest = (
  principal,
  rate,
  method = 'simple',
  freq = 'monthly',
  roiType = 'monthly'
) => calculateInterest(principal, rate, 1, method, freq, roiType);

/** Net amount disbursed to customer after processing, charge, and prepaid first-month interest. */
export const calculateNetLoanDisbursement = ({
  principal,
  processAmt = 0,
  chargeAmt = 0,
  firstMonthIntEnabled = false,
  roi = 0,
  interestMethod = 'simple',
  compoundFreq = 'monthly',
  roiType = 'monthly',
}) => {
  const prin = parseFloat(principal) || 0;
  const process = parseFloat(processAmt) || 0;
  const charge = parseFloat(chargeAmt) || 0;
  const enabled =
    firstMonthIntEnabled === true ||
    firstMonthIntEnabled === 'Y' ||
    firstMonthIntEnabled === 'y';
  const firstMonthInt = enabled
    ? calculateFirstMonthInterest(principal, roi, interestMethod, compoundFreq, roiType)
    : 0;
  return parseFloat(Math.max(0, prin - process - charge - firstMonthInt).toFixed(2));
};

/** Form fields that trigger net disbursement (cash) recalculation on Add/Update Loan. */
export const LOAN_DISBURSEMENT_FIELDS = new Set([
  'girv_prin_amt',
  'girv_process_per',
  'girv_process_amt',
  'girv_charge_per',
  'girv_charge_amt',
  'girv_first_int',
  'girv_roi',
  'girv_interest_method',
  'girv_compound_freq',
  'girv_roi_type',
]);

/** Parse stored date as local calendar day — interest starts on this date (inclusive). */
const toCalendarDay = (value) => {
  if (!value) return null;
  const datePart = String(value).trim().slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    return moment(datePart, 'YYYY-MM-DD', true).startOf('day');
  }
  const parsed = moment(value).startOf('day');
  return parsed.isValid() ? parsed : null;
};

/**
 * Count billable months: each full month + any extra days = +1 full month.
 * Min 1 month (even same-day loan).
 * e.g. 1 month 1 day → 2 months; ₹1000 @ 1% → ₹10 + ₹10 = ₹20
 */
export const getTenureMonths = (startDate, endDate = moment()) => {
  const start = toCalendarDay(startDate);
  const end = toCalendarDay(endDate) ?? moment().startOf('day');
  if (!start?.isValid() || !end?.isValid()) return 1;
  if (end.isBefore(start, 'day')) return 0;

  const years = end.diff(start, 'years');
  const afterYears = start.clone().add(years, 'years');
  const months = end.diff(afterYears, 'months');
  const afterMonths = afterYears.clone().add(months, 'months');
  const days = end.diff(afterMonths, 'days');

  let totalMonths = years * 12 + months;
  if (days > 0) totalMonths += 1;

  return Math.max(1, totalMonths);
};

/** Single entry: billable months from dates, then interest (all method/ROI types). */
export const calculateInterestForPeriod = (
  principal,
  rate,
  startDate,
  endDate = moment(),
  method = 'simple',
  freq = 'monthly',
  roiType = 'monthly'
) => {
  const months = getTenureMonths(startDate, endDate);
  return calculateInterest(principal, rate, months, method, freq, roiType);
};

export const isFirstMonthInterestEnabled = (loan) =>
  loan?.girv_first_int === 'Y' || loan?.girv_first_int === true;

/** Last date interest should accrue — stops after full principal is deposited. */
export const resolveLoanInterestEndDate = (data, asOfDate = moment()) => {
  const today = moment(asOfDate);
  const currentTotalPrincipal = parseFloat(data?.girv_prin_amt) || 0;
  if (currentTotalPrincipal > 0 || !data?.deposits?.length) return today;

  const principalDepositDates = data.deposits
    .filter((dep) => (parseFloat(dep.dep_prin_amt) || 0) > 0)
    .map((dep) => toCalendarDay(dep.dep_trans_date))
    .filter(Boolean);
  if (!principalDepositDates.length) return today;

  return principalDepositDates.reduce((latest, date) =>
    date.isAfter(latest) ? date : latest
  );
};

/**
 * Full pending interest breakdown for a loan (includes AP + first-month prepaid).
 */
export const getLoanInterestSummary = (data, asOfDate = moment()) => {
  if (!data) {
    return {
      originalPrincipal: 0,
      currentTotalPrincipal: 0,
      totalDepositsPrincipal: 0,
      totalReleasesPrincipal: 0,
      origInterest: 0,
      additionalInterestTotal: 0,
      totalInterest: 0,
      firstMonthInterest: 0,
      totalDepositsInterest: 0,
      totalReleasesInterest: 0,
      pendingInterest: 0,
      pendingPrincipal: 0,
      pending: 0,
      totalDueAmount: 0,
    };
  }

  const today = moment(asOfDate);
  const totalAdditionalPrincipal =
    data.additionalPrincipals?.reduce(
      (sum, ap) => sum + (parseFloat(ap.ap_prin_amt) || 0),
      0
    ) || 0;
  const totalReleasesPrincipal =
    data.releases?.reduce((sum, rel) => sum + (parseFloat(rel.rel_prin_amt) || 0), 0) || 0;
  const totalDepositsPrincipal =
    data.deposits?.reduce((sum, dep) => sum + (parseFloat(dep.dep_prin_amt) || 0), 0) || 0;
  const currentTotalPrincipal = parseFloat(data.girv_prin_amt) || 0;
  const originalPrincipal = Math.max(
    0,
    currentTotalPrincipal + totalReleasesPrincipal + totalDepositsPrincipal - totalAdditionalPrincipal
  );

  const roi = parseFloat(data.girv_roi) || 0;
  const roiType = data.girv_roi_type || 'monthly';
  const interestMethod = data.girv_interest_method || 'simple';
  const compoundFreq = data.girv_compound_freq || 'monthly';

  const interestEndDate = resolveLoanInterestEndDate(data, today);

  const origInterest = calculateInterestForPeriod(
    originalPrincipal,
    roi,
    data.girv_start_date,
    interestEndDate,
    interestMethod,
    compoundFreq,
    roiType
  );

  let additionalInterestTotal = 0;
  if (currentTotalPrincipal > 0 && data.additionalPrincipals?.length) {
    data.additionalPrincipals.forEach((ap) => {
      const apPrin = parseFloat(ap.ap_prin_amt) || 0;
      const apRoi = parseFloat(ap.ap_roi) || roi;
      additionalInterestTotal += calculateInterestForPeriod(
        apPrin,
        apRoi,
        ap.ap_trans_date,
        interestEndDate,
        interestMethod,
        compoundFreq,
        roiType
      );
    });
  }

  const totalInterest = parseFloat((origInterest + additionalInterestTotal).toFixed(2));
  const totalReleasesInterest =
    data.releases?.reduce((sum, rel) => sum + (parseFloat(rel.rel_int_amt) || 0), 0) || 0;
  const totalDepositsInterest =
    data.deposits?.reduce((sum, dep) => sum + (parseFloat(dep.dep_int_amt) || 0), 0) || 0;

  // First-month interest is prepaid at loan create (journal) — deduct from pending
  const firstMonthInterest = isFirstMonthInterestEnabled(data)
    ? calculateFirstMonthInterest(
        originalPrincipal,
        roi,
        interestMethod,
        compoundFreq,
        roiType
      )
    : 0;

  const pendingInterest = Math.max(
    0,
    parseFloat(
      (totalInterest - totalDepositsInterest - totalReleasesInterest - firstMonthInterest).toFixed(2)
    )
  );
  const pendingPrincipal = currentTotalPrincipal;
  const pending = parseFloat((pendingPrincipal + pendingInterest).toFixed(2));
  const totalDueAmount = pending;

  return {
    originalPrincipal,
    currentTotalPrincipal,
    totalDepositsPrincipal,
    totalReleasesPrincipal,
    origInterest,
    additionalInterestTotal,
    totalInterest,
    firstMonthInterest,
    totalDepositsInterest,
    totalReleasesInterest,
    pendingInterest,
    pendingPrincipal,
    pending,
    totalDueAmount,
    roi,
    roiType,
    interestMethod,
    compoundFreq,
  };
};
