import { formatListAmt } from './listFormatters';

export const stockLoanRef = (loan) =>
  loan?.girv_unique_code ||
  loan?.girv_loan_no ||
  (loan?.girv_id ? `LN-${loan.girv_id}` : '—');

export const stockCustomerName = (user) => {
  if (!user) return '—';
  const name = `${user.user_first_name || ''} ${user.user_last_name || ''}`.trim();
  return name || '—';
};

export const formatStockWeight = (weight, type) => {
  const w = parseFloat(weight) || 0;
  return `${w.toFixed(3)} ${type || 'GM'}`;
};

export const stockValuation = (row) =>
  parseFloat(row?.st_final_valuation || row?.st_valuation) || 0;

export const formatStockValuation = (row) => formatListAmt(stockValuation(row));

/** Route segment for stock details (uuid preferred, numeric id fallback). */
export const getStockDetailId = (row) => {
  if (!row) return null;
  if (row.st_uuid) return String(row.st_uuid);
  if (row.st_id != null && row.st_id !== '') return String(row.st_id);
  return null;
};

export const stockDetailsPath = (row) => {
  const id = getStockDetailId(row);
  return id ? `/stock/details/${id}` : null;
};

/** CSS class for gold / silver metal badge styling. */
export const stockMetalToneClass = (metal) => {
  const value = String(metal || '').toLowerCase();
  if (value.includes('gold')) return 'stock-metal--gold';
  if (value.includes('silver')) return 'stock-metal--silver';
  return 'stock-metal--default';
};
