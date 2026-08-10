/**
 * Finance amounts (aligned with proper ledger):
 * - receivable = principal + flat interest (ROI % of principal for tenure)
 * - disbursed (fin_final_amt) = principal − process fee  (cash out)
 * - EMI = receivable / n  (schedule total = receivable = DR loan)
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

  let emi = 0;
  if (receivable > 0 && n > 0) {
    emi = receivable / n;
  }

  return {
    fin_emi_amt: emi > 0 ? emi.toFixed(2) : "0.00",
    fin_final_amt: disbursed > 0 ? disbursed.toFixed(2) : "0.00",
    fin_interest_amt: interestAmt.toFixed(2),
    fin_receivable_amt: receivable > 0 ? receivable.toFixed(2) : "0.00",
  };
};

export default useAddFinanceCalculator;
