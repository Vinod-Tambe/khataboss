/**
 * Receivable must divide evenly by EMI count (whole rupee per EMI, no paise remainder).
 */
export function isWholeNumberEmi(receivable, emiCount) {
  const n = parseInt(emiCount, 10) || 0;
  const total = parseFloat(receivable) || 0;
  if (!(total > 0 && n > 0)) return true;
  const receivablePaise = Math.round(total * 100);
  return receivablePaise % n === 0;
}

export function getWholeEmiAmount(receivable, emiCount) {
  const n = parseInt(emiCount, 10) || 0;
  const total = parseFloat(receivable) || 0;
  if (!(total > 0 && n > 0)) return 0;
  const receivablePaise = Math.round(total * 100);
  return receivablePaise / n / 100;
}

/** Display EMI without float rounding errors (e.g. 540÷10 → 54, not 55). */
export function formatWholeEmiDisplay(receivable, emiCount, isValid = true) {
  const n = parseInt(emiCount, 10) || 0;
  const receivablePaise = Math.round((parseFloat(receivable) || 0) * 100);
  if (!(receivablePaise > 0 && n > 0)) return '0';
  const emiPaise = receivablePaise / n;
  if (!isValid) {
    return (emiPaise / 100).toFixed(2);
  }
  return String(emiPaise / 100);
}

export const WHOLE_EMI_ERROR =
  'Per EMI amount must be a whole number. Total receivable must divide evenly by No Of EMI — adjust principal, ROI, or EMI count.';
