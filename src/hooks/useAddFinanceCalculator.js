import {
  isWholeNumberEmi,
  formatWholeEmiDisplay,
  WHOLE_EMI_ERROR,
} from '../utils/financeEmiValidation';

/**
 * Finance amounts (aligned with proper ledger):
 * - EMI = principal / n (whole number — interest collected separately)
 * - receivable = principal + flat interest (display / total customer owes)
 * - disbursed (fin_final_amt) = principal − process fee  (cash out)
 */
const useAddFinanceCalculator = ({
  fin_prin_amt,
  fin_no_of_emi,
  fin_freq_type = "MONTHLY",
  fin_proccess_amt = 0,
  fin_roi = 0,
}) => {
  const prin = parseFloat(fin_prin_amt) || 0;
  const n = parseInt(fin_no_of_emi, 10) || 0;
  const processAmt = parseFloat(fin_proccess_amt) || 0;
  const roi = parseFloat(fin_roi) || 0;

  void fin_freq_type;

  const interestAmt =
    prin > 0 && roi > 0 ? parseFloat(((prin * roi) / 100).toFixed(2)) : 0;
  const receivable = parseFloat((prin + interestAmt).toFixed(2));
  const disbursed = parseFloat(Math.max(0, prin - processAmt).toFixed(2));

  const hasEmiInputs = prin > 0 && n > 0;
  const isEmiInvalid = hasEmiInputs && !isWholeNumberEmi(prin, n);

  return {
    fin_emi_amt: hasEmiInputs
      ? formatWholeEmiDisplay(prin, n, !isEmiInvalid)
      : '0',
    fin_final_amt: disbursed > 0 ? disbursed.toFixed(2) : '0.00',
    fin_interest_amt: interestAmt.toFixed(2),
    fin_receivable_amt: receivable > 0 ? receivable.toFixed(2) : '0.00',
    isEmiInvalid,
    emiError: isEmiInvalid ? WHOLE_EMI_ERROR : null,
  };
};

export default useAddFinanceCalculator;
