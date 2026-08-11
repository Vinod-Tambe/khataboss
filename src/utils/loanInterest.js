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
 * Accrued interest for a principal over `months` tenure.
 * `rate` is the stored ROI; `roiType` decides monthly vs annual.
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
  const m = parseFloat(months) || 0;
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

export const getTenureMonths = (startDate, endDate = moment()) => {
  if (!startDate) return 1;
  const start = moment(startDate);
  const end = moment(endDate);
  if (!start.isValid() || !end.isValid()) return 1;
  return Math.max(1, end.diff(start, 'months'));
};

export const isFirstMonthInterestEnabled = (loan) =>
  loan?.girv_first_int === 'Y' || loan?.girv_first_int === true;

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

  const origMonths = getTenureMonths(data.girv_start_date, today);
  const origInterest = calculateInterest(
    originalPrincipal,
    roi,
    origMonths,
    interestMethod,
    compoundFreq,
    roiType
  );

  let additionalInterestTotal = 0;
  if (data.additionalPrincipals?.length) {
    data.additionalPrincipals.forEach((ap) => {
      const apPrin = parseFloat(ap.ap_prin_amt) || 0;
      const apRoi = parseFloat(ap.ap_roi) || roi;
      const apMonths = getTenureMonths(ap.ap_trans_date, today);
      additionalInterestTotal += calculateInterest(
        apPrin,
        apRoi,
        apMonths,
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
    pending: pendingPrincipal + pendingInterest,
    roi,
    roiType,
    interestMethod,
    compoundFreq,
  };
};
