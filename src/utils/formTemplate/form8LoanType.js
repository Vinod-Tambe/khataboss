export const FORM8_LOAN_TYPES = ['secured', 'unsecured'];

export const FORM8_STOCK_BLOCK_ID = 'stock_line_items';

export const normalizeForm8LoanType = (value) =>
  String(value || '').toLowerCase() === 'unsecured' ? 'unsecured' : 'secured';

export const isForm8SecuredTemplate = (configOrType) => {
  if (configOrType && typeof configOrType === 'object') {
    return normalizeForm8LoanType(configOrType.loanType || configOrType.form8LoanType) === 'secured';
  }
  return normalizeForm8LoanType(configOrType) === 'secured';
};

export const getForm8LoanTypeLabel = (value) =>
  normalizeForm8LoanType(value) === 'unsecured' ? 'Unsecured' : 'Secured';

export const stripForm8StockBlocks = (order = []) =>
  (Array.isArray(order) ? order : []).filter((id) => id !== FORM8_STOCK_BLOCK_ID);

export const ensureForm8StockBlock = (order = []) => {
  const next = Array.isArray(order) ? [...order] : [];
  if (next.includes(FORM8_STOCK_BLOCK_ID)) return next;
  const loanIdx = next.indexOf('section:loan_details');
  if (loanIdx >= 0) {
    next.splice(loanIdx + 1, 0, FORM8_STOCK_BLOCK_ID);
    return next;
  }
  const termsIdx = next.indexOf('form_terms');
  if (termsIdx >= 0) {
    next.splice(termsIdx, 0, FORM8_STOCK_BLOCK_ID);
    return next;
  }
  next.push(FORM8_STOCK_BLOCK_ID);
  return next;
};
