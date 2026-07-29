export const calculateTrialBalanceTotals = (data = []) =>
  data.reduce(
    (acc, item) => {
      acc.open += item.acc_open_balance || 0;
      acc.dr += item.total_dr_amt || 0;
      acc.cr += item.total_cr_amt || 0;
      acc.close += item.acc_close_balance || 0;
      return acc;
    },
    { open: 0, dr: 0, cr: 0, close: 0 }
  );

/** Desktop/table format: "123.45 DR" / "123.45 CR" */
export const formatBalance = (val) => {
  if (val === 0) return "0.00";
  const absVal = Math.abs(val).toFixed(2);
  return val > 0 ? `${absVal} DR` : `${absVal} CR`;
};

export const formatCurrency = (val) => {
  const amount = Math.abs(parseFloat(val) || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${amount}`;
};

/** Mobile signed balance: "Dr ₹25,000.00" / "Cr ₹25,000.00" */
export const formatSignedBalance = (val) => {
  const num = parseFloat(val) || 0;
  if (num === 0) return formatCurrency(0);
  const prefix = num > 0 ? "DR" : "CR";
  return `${prefix} ${formatCurrency(num)}`;
};

/** Positive = DR (green), Negative = CR (red) — matches Trial Balance sign convention */
export const getBalanceTone = (val) => {
  const num = parseFloat(val) || 0;
  if (num === 0) return "zero";
  return num > 0 ? "dr" : "cr";
};
