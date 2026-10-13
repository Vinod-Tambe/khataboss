/** Stock line-items table columns (preview + PDF). */
export const FORM8_STOCK_TABLE_COLUMNS = [
  { id: 'metal', label: 'METAL', align: 'left', pdfWidth: 36 },
  { id: 'item_name', label: 'ITEM NAME', align: 'left', pdfWidth: '*' },
  { id: 'quantity', label: 'QTY', align: 'center', pdfWidth: 24 },
  { id: 'gs_weight', label: 'GS WT', align: 'right', pdfWidth: 40 },
  { id: 'nt_weight', label: 'NT WT', align: 'right', pdfWidth: 40 },
  { id: 'purity', label: 'PURITY', align: 'center', pdfWidth: 36 },
  { id: 'rate', label: 'RATE', align: 'right', pdfWidth: 40 },
  { id: 'fine_weight', label: 'FINE WT', align: 'right', pdfWidth: 40 },
  { id: 'valuation', label: 'VALUATION', align: 'right', pdfWidth: 52 },
  { id: 'image', label: 'IMAGE', align: 'center', pdfWidth: 40 },
];

const hiddenColumnSet = (layoutSpec = {}) =>
  new Set(Array.isArray(layoutSpec.stockHiddenColumns) ? layoutSpec.stockHiddenColumns : []);

export const isForm8StockColumnVisible = (layoutSpec, columnId) =>
  !hiddenColumnSet(layoutSpec).has(columnId);

export const getVisibleForm8StockColumns = (layoutSpec = {}) => {
  const hidden = hiddenColumnSet(layoutSpec);
  const visible = FORM8_STOCK_TABLE_COLUMNS.filter((col) => !hidden.has(col.id));
  return visible.length ? visible : FORM8_STOCK_TABLE_COLUMNS;
};

export const getForm8StockCellValue = (row, columnId) => {
  if (!row || columnId === 'image') return null;
  const raw = row[columnId];
  if (raw == null || raw === '') return '—';
  return String(raw);
};

export const FORM8_STOCK_WEIGHT_COLUMN_IDS = new Set([
  'gs_weight',
  'nt_weight',
  'fine_weight',
]);

const parseStockWeight = (raw) => {
  const s = String(raw || '').trim();
  if (!s || s === '—') return { value: 0, unit: '' };
  const m = s.match(/^([\d,.]+)\s*(.*)$/);
  if (!m) return { value: 0, unit: '' };
  return {
    value: parseFloat(m[1].replace(/,/g, '')) || 0,
    unit: (m[2] || '').trim(),
  };
};

export const formatForm8StockWeightTotal = (rows, columnId) => {
  let total = 0;
  let unit = '';
  (rows || []).forEach((row) => {
    const parsed = parseStockWeight(row?.[columnId]);
    total += parsed.value;
    if (parsed.unit && !unit) unit = parsed.unit;
  });
  if (!total) return '—';
  return `${total.toFixed(3)}${unit ? ` ${unit}` : ''}`;
};

export const getForm8StockFooterCellValue = (rows, columnId, columns = []) => {
  if (columnId === 'image') return '';
  if (FORM8_STOCK_WEIGHT_COLUMN_IDS.has(columnId)) {
    return formatForm8StockWeightTotal(rows, columnId);
  }
  const labelCol = columns.find(
    (col) => col.id !== 'image' && !FORM8_STOCK_WEIGHT_COLUMN_IDS.has(col.id)
  );
  if (labelCol && columnId === labelCol.id) return 'TOTAL';
  return '';
};
