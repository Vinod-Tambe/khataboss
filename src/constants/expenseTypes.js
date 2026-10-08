export const EXPENSE_TYPE_OPTIONS = [
  { code: 'PERSONAL', label: 'Personal Expense' },
  { code: 'JOURNAL', label: 'Journal Expense' },
  { code: 'BUSINESS', label: 'Business Expense' },
  { code: 'OFFICE', label: 'Office Expense' },
];

export const DEFAULT_EXPENSE_TYPE_CODE = 'PERSONAL';

export const getExpenseTypeLabel = (codeOrPanel) => {
  const raw = String(codeOrPanel ?? '').trim();
  if (!raw) {
    return EXPENSE_TYPE_OPTIONS.find((o) => o.code === DEFAULT_EXPENSE_TYPE_CODE).label;
  }
  const byCode = EXPENSE_TYPE_OPTIONS.find((o) => o.code === raw.toUpperCase());
  if (byCode) return byCode.label;
  const byLabel = EXPENSE_TYPE_OPTIONS.find(
    (o) => o.label.toLowerCase() === raw.toLowerCase()
  );
  if (byLabel) return byLabel.label;
  return raw;
};
