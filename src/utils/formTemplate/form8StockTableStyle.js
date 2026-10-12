import {
  getForm8BlockPdfBodyProps,
  getForm8BlockPdfLabelProps,
} from './form8BlockStyle';

const hasValue = (v) => v != null && String(v).trim() !== '';

const hexToPdf = (hex, fallback) => {
  const h = String(hex || fallback || '#000000').replace('#', '');
  return h.length === 6 ? `#${h}` : `#${String(fallback || '000000').replace('#', '')}`;
};

/** CSS variables for stock / line-item table (set on section wrapper). */
export const getForm8StockTablePreviewVars = (layoutSpec = {}, theme = {}) => {
  const vars = {};
  const headerBg =
    layoutSpec.tableHeaderBackgroundColor ||
    layoutSpec.titleBackgroundColor ||
    theme.tableHeaderBackground;
  const headerColor =
    layoutSpec.labelColor || layoutSpec.titleColor || theme.sectionTitleColor;
  const cellBg = layoutSpec.tableBodyBackgroundColor;
  const cellColor = layoutSpec.bodyColor || theme.textColor;
  const border = layoutSpec.tableBorderColor || layoutSpec.borderColor || theme.borderColor;

  if (hasValue(headerBg)) vars['--ft-stock-th-bg'] = headerBg;
  if (hasValue(headerColor)) vars['--ft-stock-th-color'] = headerColor;
  if (hasValue(cellBg)) vars['--ft-stock-td-bg'] = cellBg;
  if (hasValue(cellColor)) vars['--ft-stock-td-color'] = cellColor;
  if (hasValue(border)) vars['--ft-stock-border'] = border;

  return vars;
};

export const stockTableHasGridBorder = (layoutSpec = {}) =>
  hasValue(layoutSpec.tableBorderColor);

export const buildStockItemsTablePdf = (
  stockItemRows,
  registerPdfImage,
  theme,
  layoutSpec,
  labelFontPt,
  valueFontPt,
  columns,
  getCellValue
) => {
  if (!stockItemRows?.length) return null;

  const headerStyle = getForm8BlockPdfLabelProps(layoutSpec, theme, labelFontPt);
  const bodyStyle = getForm8BlockPdfBodyProps(layoutSpec, theme, labelFontPt, valueFontPt);
  const headerBg = hexToPdf(
    layoutSpec.tableHeaderBackgroundColor ||
      layoutSpec.titleBackgroundColor ||
      theme.tableHeaderBackground,
    theme.tableHeaderBackground
  );
  const bodyBg = hasValue(layoutSpec.tableBodyBackgroundColor)
    ? hexToPdf(layoutSpec.tableBodyBackgroundColor, '#ffffff')
    : undefined;
  const borderColor = hexToPdf(
    layoutSpec.tableBorderColor || layoutSpec.borderColor || theme.borderColor,
    theme.borderColor
  );
  const gridBorder = stockTableHasGridBorder(layoutSpec);
  const lineW = gridBorder ? 0.5 : 0;

  const header = columns.map((col) => ({
    text: col.label,
    fontSize: headerStyle.fontSize,
    bold: headerStyle.bold,
    color: hexToPdf(headerStyle.color, theme.sectionTitleColor),
    fillColor: headerBg,
    alignment: col.align === 'right' ? 'right' : col.align === 'center' ? 'center' : 'left',
  }));

  const body = stockItemRows.map((row) =>
    columns.map((col) => {
      if (col.id === 'image') {
        const imageKey = registerPdfImage(row.imageKey, row.imageDataUrl);
        return imageKey
          ? {
              image: imageKey,
              width: 48,
              height: 48,
              margin: [2, 2, 2, 2],
              fillColor: bodyBg,
            }
          : {
              text: '—',
              alignment: 'center',
              fontSize: bodyStyle.fontSize,
              color: hexToPdf(bodyStyle.color, theme.textColor),
              fillColor: bodyBg,
            };
      }
      return {
        text: getCellValue(row, col.id),
        fontSize: bodyStyle.fontSize,
        bold: bodyStyle.bold,
        color: hexToPdf(bodyStyle.color, theme.textColor),
        fillColor: bodyBg,
        alignment: col.align === 'right' ? 'right' : col.align === 'center' ? 'center' : 'left',
      };
    })
  );

  return {
    table: {
      headerRows: 1,
      widths: [44, 52, '*', 26, 48, 48, 40, 56],
      body: [header, ...body],
    },
    layout: {
      hLineWidth: () => lineW,
      vLineWidth: () => lineW,
      hLineColor: () => borderColor,
      vLineColor: () => borderColor,
      paddingLeft: () => 4,
      paddingRight: () => 4,
      paddingTop: () => 3,
      paddingBottom: () => 3,
    },
    margin: [0, 4, 0, 0],
  };
};
