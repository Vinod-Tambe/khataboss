/**
 * Finance ROI interest — same billable-month tenure rules as loan interest.
 */
import { calculateInterestForPeriod } from './loanInterest';

export function sumPaidInterest(moneyTrans = []) {
  let interestPaid = 0;

  for (const t of moneyTrans || []) {
    if (t.fm_is_deleted) continue;
    const type = (t.fm_trans_type || '').toUpperCase();
    const amt = parseFloat(t.fm_trans_amt) || 0;
    const info = t.fm_pay_info || '';

    if (type === 'INTEREST') {
      const m = /INT:([\d.]+)/i.exec(info);
      interestPaid += m ? parseFloat(m[1]) || 0 : amt;
    } else if (type === 'ROLLBACK') {
      const m = /ROLLBACK_INT:([\d.]+)/i.exec(info);
      if (m) interestPaid -= parseFloat(m[1]) || 0;
    }
  }

  return parseFloat(Math.max(0, interestPaid).toFixed(2));
}

export function isBundledInterestFinance(finance = {}) {
  const prin = parseFloat(finance.fin_prin_amt) || 0;
  const scheduleTotal = (finance.finance_trans || []).reduce(
    (sum, row) => sum + (parseFloat(row.ft_emi_amt) || 0),
    0
  );
  return scheduleTotal > prin + 0.01;
}

export function buildFinanceInterestSummary(finance = {}, moneyTrans = null, asOfDate = null) {
  const prin = parseFloat(finance.fin_prin_amt) || 0;
  const roi = parseFloat(finance.fin_roi) || 0;
  const processAmt = parseFloat(finance.fin_proccess_amt) || 0;
  const endDate = asOfDate || new Date();
  const interestAmt =
    prin > 0 && roi > 0 && finance.fin_start_date
      ? calculateInterestForPeriod(
          prin,
          roi,
          finance.fin_start_date,
          endDate,
          'simple',
          'monthly',
          'monthly'
        )
      : prin > 0 && roi > 0
        ? parseFloat(((prin * roi) / 100).toFixed(2))
        : 0;
  const receivable = parseFloat((prin + interestAmt).toFixed(2));
  const disbursed =
    parseFloat(finance.fin_final_amt) ||
    parseFloat(Math.max(0, prin - processAmt).toFixed(2));
  const scheduleTotal = (finance.finance_trans || []).reduce(
    (sum, row) => sum + (parseFloat(row.ft_emi_amt) || 0),
    0
  );

  const bundled = isBundledInterestFinance(finance);
  const interestSeparate = !bundled && interestAmt > 0;
  const trans = moneyTrans ?? finance.finance_money_trans ?? [];
  const interestPaid = interestSeparate ? sumPaidInterest(trans) : 0;
  const pendingInterest = interestSeparate
    ? parseFloat(Math.max(0, interestAmt - interestPaid).toFixed(2))
    : 0;

  return {
    roi_percent: roi,
    roi_display: roi > 0 ? `${roi}%` : '0%',
    interest_amt: interestAmt,
    receivable_amt: receivable,
    principal_amt: prin,
    process_fee_amt: processAmt,
    disbursed_amt: disbursed,
    emi_amt: parseFloat(finance.fin_emi_amt) || 0,
    no_of_emi: parseInt(finance.fin_no_of_emi, 10) || 0,
    schedule_total: parseFloat(scheduleTotal.toFixed(2)),
    interest_separate: interestSeparate,
    interest_bundled: bundled,
    interest_paid: interestPaid,
    pending_interest: pendingInterest,
  };
}
