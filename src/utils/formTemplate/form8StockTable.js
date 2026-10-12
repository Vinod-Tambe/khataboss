/** Stock line-items table columns (preview + PDF). */
export const FORM8_STOCK_TABLE_COLUMNS = [
  { id: 'image', label: 'Image', align: 'center' },
  { id: 'metal', label: 'Metal', align: 'left' },
  { id: 'item_name', label: 'Description', align: 'left' },
  { id: 'quantity', label: 'Pcs', align: 'center' },
  { id: 'gs_weight', label: 'Gross wt', align: 'right' },
  { id: 'nt_weight', label: 'Net wt', align: 'right' },
  { id: 'purity', label: 'Purity', align: 'center' },
  { id: 'valuation', label: 'Value (Rs.)', align: 'right' },
];

export const getForm8StockCellValue = (row, columnId) => {
  if (!row || columnId === 'image') return null;
  const raw = row[columnId];
  if (raw == null || raw === '') return '—';
  return String(raw);
};
