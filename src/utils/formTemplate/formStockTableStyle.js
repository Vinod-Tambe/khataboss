import {
  getForm8BlockPdfBodyProps,
  getForm8BlockPdfLabelProps,
} from './formBlockStyle';
import { isForm8SectionBorderOn, pdfBoldFromWeight } from './formSectionStyle';
import { getForm8StockFooterCellValue } from './formStockTable';

const hasValue = (v) => v != null && String(v).trim() !== '';

const parseNum = (raw, fallback) => {
  if (raw === null || raw === undefined || raw === '') return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
};

const hexToPdf = (hex, fallback) => {
  const h = String(hex || fallback || '#000000').replace('#', '');
  return h.length === 6 ? `#${h}` : `#${String(fallback || '000000').replace('#', '')}`;
};

export const isForm8TableBorderOn = (layoutSpec) => {
  const v = layoutSpec?.tableBorder;
  if (v === true || v === 1 || v === '1' || String(v).toLowerCase() === 'true') return true;
  if (v === '' || v === '0' || v === false) return false;
  return hasValue(layoutSpec?.tableBorderColor);
};

/** Outer stock section box (background, border, radius). */
export const getForm8StockSectionBoxStyle = (layoutSpec = {}) => {
  const style = {};
  if (hasValue(layoutSpec.backgroundColor)) style.backgroundColor = layoutSpec.backgroundColor;
  if (isForm8SectionBorderOn(layoutSpec)) {
    const color = hasValue(layoutSpec.borderColor) ? layoutSpec.borderColor : '#2c5282';
    const width = parseNum(layoutSpec.sectionBorderWidth, 1);
    style.border = `${width}px solid ${color}`;
  }
  const radius = parseNum(layoutSpec.sectionBorderRadius, null);
  if (radius != null) {
    style.borderRadius = `${radius}px`;
    style.overflow = 'hidden';
  }
  return style;
};

/** CSS variables for stock / line-item table (set on section wrapper). */
export const getForm8StockTablePreviewVars = (layoutSpec = {}, theme = {}) => {
  const vars = {};
  const tableOn = isForm8TableBorderOn(layoutSpec);
  const tableBorderColor = hasValue(layoutSpec.tableBorderColor)
    ? layoutSpec.tableBorderColor
    : theme.borderColor || '#2c5282';
  const tableBorderWidth = parseNum(layoutSpec.tableBorderWidth, 1);
  const tableRadius = parseNum(layoutSpec.tableBorderRadius, 0);

  const headerBg =
    layoutSpec.tableHeaderBackgroundColor ||
    layoutSpec.titleBackgroundColor ||
    theme.tableHeaderBackground;
  const headerColor =
    layoutSpec.tableHeaderColor ||
    layoutSpec.labelColor ||
    layoutSpec.titleColor ||
    theme.sectionTitleColor;

  const cellBg = layoutSpec.tableBodyBackgroundColor;
  const cellColor = layoutSpec.tableBodyColor || layoutSpec.bodyColor || theme.textColor;

  const footerBg = layoutSpec.tableFooterBackgroundColor || headerBg;
  const footerColor = layoutSpec.tableFooterColor || headerColor;

  if (hasValue(headerBg)) vars['--ft-stock-th-bg'] = headerBg;
  if (hasValue(headerColor)) vars['--ft-stock-th-color'] = headerColor;
  if (hasValue(layoutSpec.tableHeaderFontSizePt)) {
    vars['--ft-stock-th-font-pt'] = `${layoutSpec.tableHeaderFontSizePt}pt`;
  } else if (hasValue(layoutSpec.labelFontSizePt)) {
    vars['--ft-stock-th-font-pt'] = `${layoutSpec.labelFontSizePt}pt`;
  }
  if (hasValue(layoutSpec.tableHeaderFontWeight)) {
    vars['--ft-stock-th-font-weight'] = layoutSpec.tableHeaderFontWeight;
  } else if (hasValue(layoutSpec.labelFontWeight)) {
    vars['--ft-stock-th-font-weight'] = layoutSpec.labelFontWeight;
  }

  if (hasValue(cellBg)) vars['--ft-stock-td-bg'] = cellBg;
  if (hasValue(cellColor)) vars['--ft-stock-td-color'] = cellColor;
  if (hasValue(layoutSpec.tableBodyFontSizePt)) {
    vars['--ft-stock-td-font-pt'] = `${layoutSpec.tableBodyFontSizePt}pt`;
  } else if (hasValue(layoutSpec.valueFontSizePt) || hasValue(layoutSpec.bodyFontSizePt)) {
    vars['--ft-stock-td-font-pt'] = `${
      layoutSpec.valueFontSizePt || layoutSpec.bodyFontSizePt
    }pt`;
  }
  if (hasValue(layoutSpec.tableBodyFontWeight)) {
    vars['--ft-stock-td-font-weight'] = layoutSpec.tableBodyFontWeight;
  } else if (hasValue(layoutSpec.valueFontWeight) || hasValue(layoutSpec.bodyFontWeight)) {
    vars['--ft-stock-td-font-weight'] =
      layoutSpec.valueFontWeight || layoutSpec.bodyFontWeight;
  }

  if (hasValue(footerBg)) vars['--ft-stock-tf-bg'] = footerBg;
  if (hasValue(footerColor)) vars['--ft-stock-tf-color'] = footerColor;
  if (hasValue(layoutSpec.tableFooterFontSizePt)) {
    vars['--ft-stock-tf-font-pt'] = `${layoutSpec.tableFooterFontSizePt}pt`;
  }
  if (hasValue(layoutSpec.tableFooterFontWeight)) {
    vars['--ft-stock-tf-font-weight'] = layoutSpec.tableFooterFontWeight;
  }

  vars['--ft-stock-table-border'] = tableOn
    ? `${tableBorderWidth}px solid ${tableBorderColor}`
    : 'none';
  vars['--ft-stock-table-border-color'] = tableBorderColor;
  vars['--ft-stock-table-border-width'] = `${tableBorderWidth}px`;
  vars['--ft-stock-table-radius'] = `${tableRadius}px`;

  return vars;
};

export const stockTableHasGridBorder = (layoutSpec = {}) => isForm8TableBorderOn(layoutSpec);

export const getForm8StockCellBorderStyle = (layoutSpec = {}, theme = {}) => {
  if (!isForm8TableBorderOn(layoutSpec)) {
    return { border: 'none' };
  }
  const color = hasValue(layoutSpec.tableBorderColor)
    ? layoutSpec.tableBorderColor
    : theme.borderColor || '#2c5282';
  const width = parseNum(layoutSpec.tableBorderWidth, 1);
  return {
    borderStyle: 'solid',
    borderColor: color,
    borderWidth: `${width}px`,
  };
};

const partFillStyle = (
  layoutSpec,
  {
    colorKey,
    bgKey,
    sizeKey,
    weightKey,
    fallbackColor,
    fallbackBg,
    fallbackPt,
    defaultBold,
  }
) => ({
  color: hexToPdf(
    hasValue(layoutSpec[colorKey]) ? layoutSpec[colorKey] : fallbackColor,
    fallbackColor
  ),
  fillColor: hasValue(layoutSpec[bgKey]) ? hexToPdf(layoutSpec[bgKey], fallbackBg) : fallbackBg
    ? hexToPdf(fallbackBg, fallbackBg)
    : undefined,
  fontSize: parseNum(layoutSpec[sizeKey], fallbackPt),
  bold: pdfBoldFromWeight(layoutSpec[weightKey], defaultBold),
});

const alignOf = (col) =>
  col.align === 'right' ? 'right' : col.align === 'center' ? 'center' : 'left';

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

  const headerLegacy = getForm8BlockPdfLabelProps(layoutSpec, theme, labelFontPt);
  const bodyLegacy = getForm8BlockPdfBodyProps(layoutSpec, theme, labelFontPt, valueFontPt);

  const header = partFillStyle(layoutSpec, {
    colorKey: 'tableHeaderColor',
    bgKey: 'tableHeaderBackgroundColor',
    sizeKey: 'tableHeaderFontSizePt',
    weightKey: 'tableHeaderFontWeight',
    fallbackColor: headerLegacy.color || theme.sectionTitleColor,
    fallbackBg: layoutSpec.titleBackgroundColor || theme.tableHeaderBackground,
    fallbackPt: headerLegacy.fontSize || labelFontPt,
    defaultBold: true,
  });
  const body = partFillStyle(layoutSpec, {
    colorKey: 'tableBodyColor',
    bgKey: 'tableBodyBackgroundColor',
    sizeKey: 'tableBodyFontSizePt',
    weightKey: 'tableBodyFontWeight',
    fallbackColor: bodyLegacy.color || theme.textColor,
    fallbackBg: null,
    fallbackPt: bodyLegacy.fontSize || valueFontPt,
    defaultBold: false,
  });
  const footer = partFillStyle(layoutSpec, {
    colorKey: 'tableFooterColor',
    bgKey: 'tableFooterBackgroundColor',
    sizeKey: 'tableFooterFontSizePt',
    weightKey: 'tableFooterFontWeight',
    fallbackColor: header.color,
    fallbackBg: header.fillColor,
    fallbackPt: header.fontSize,
    defaultBold: true,
  });

  const tableOn = isForm8TableBorderOn(layoutSpec);
  const lineW = tableOn
    ? Math.max(0.3, (parseNum(layoutSpec.tableBorderWidth, 1) * 72) / 96)
    : 0;
  const lineColor = hexToPdf(
    layoutSpec.tableBorderColor || theme.borderColor,
    theme.borderColor
  );

  const headerRow = columns.map((col) => ({
    text: col.label,
    fontSize: header.fontSize,
    bold: header.bold,
    color: header.color,
    fillColor: header.fillColor,
    alignment: alignOf(col),
  }));

  const bodyRows = stockItemRows.map((row) =>
    columns.map((col) => {
      if (col.id === 'image') {
        const imageKey = registerPdfImage(row.imageKey, row.imageDataUrl);
        return imageKey
          ? {
              image: imageKey,
              width: 28,
              height: 28,
              margin: [1, 1, 1, 1],
              fillColor: body.fillColor,
            }
          : {
              text: '—',
              alignment: 'center',
              fontSize: body.fontSize,
              color: body.color,
              fillColor: body.fillColor,
            };
      }
      return {
        text: getCellValue(row, col.id),
        fontSize: body.fontSize,
        bold: body.bold,
        color: body.color,
        fillColor: body.fillColor,
        alignment: alignOf(col),
      };
    })
  );

  const footerRow = columns.map((col) => ({
    text: getForm8StockFooterCellValue(stockItemRows, col.id, columns),
    fontSize: footer.fontSize,
    bold: footer.bold,
    color: footer.color,
    fillColor: footer.fillColor,
    alignment: alignOf(col),
  }));

  return {
    table: {
      headerRows: 1,
      widths: columns.map((col) => col.pdfWidth || '*'),
      body: [headerRow, ...bodyRows, footerRow],
    },
    layout: {
      hLineWidth: () => lineW,
      vLineWidth: () => lineW,
      hLineColor: () => lineColor,
      vLineColor: () => lineColor,
      paddingLeft: () => 3,
      paddingRight: () => 3,
      paddingTop: () => 3,
      paddingBottom: () => 3,
    },
    margin: [0, 4, 0, 0],
  };
};
