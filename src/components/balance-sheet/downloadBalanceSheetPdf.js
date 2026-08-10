import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import {
  calculateBalanceSheetTotals,
  formatCurrency,
} from './balanceSheetUtils';

pdfMake.vfs = pdfFonts.vfs || pdfFonts.default?.vfs || pdfFonts;

const COLORS = {
  title: '#8B4513',
  meta: '#333333',
  headerBg: '#e9eff9',
  headerText: '#8B4513',
  footerBg: '#ffdbe1',
  footerText: '#212529',
  cellText: '#212529',
  profit: '#006400',
  loss: '#dc143c',
  altRow: '#f8f9fa',
  border: '#adb5bd',
};

const emptyCell = () => ({ text: '', style: 'tableCell' });

const buildDocDefinition = ({ data = {}, firmName, periodStart, periodEnd }) => {
  const {
    assetList,
    liabilityList,
    diffBalance,
    balancedTotal,
  } = calculateBalanceSheetTotals(data);

  const hasData = assetList.length > 0 || liabilityList.length > 0;
  const maxRows = Math.max(assetList.length, liabilityList.length);
  const body = [
    [
      { text: 'LIABILITIES', style: 'tableHeader', colSpan: 2, alignment: 'center' },
      {},
      { text: 'ASSETS', style: 'tableHeader', colSpan: 2, alignment: 'center' },
      {},
    ],
  ];

  if (!hasData) {
    body.push([
      {
        text: 'No records found for the selected period.',
        colSpan: 4,
        alignment: 'center',
        style: 'tableCell',
        margin: [0, 8, 0, 8],
      },
      {},
      {},
      {},
    ]);
  } else {
    for (let i = 0; i < maxRows; i += 1) {
      const liability = liabilityList[i];
      const asset = assetList[i];
      body.push([
        { text: liability ? (liability.name || '').toUpperCase() : '', style: 'tableCell' },
        {
          text: liability ? formatCurrency(liability.value) : '',
          style: 'tableCell',
          alignment: 'right',
        },
        { text: asset ? (asset.name || '').toUpperCase() : '', style: 'tableCell' },
        {
          text: asset ? formatCurrency(asset.value) : '',
          style: 'tableCell',
          alignment: 'right',
        },
      ]);
    }

    // Spacer row (matches desktop empty space before totals)
    body.push([
      { text: ' ', margin: [0, 18, 0, 18] },
      { text: ' ' },
      { text: ' ' },
      { text: ' ' },
    ]);

    if (diffBalance !== 0) {
      if (diffBalance > 0) {
        body.push([
          { text: 'DIFFERENCE', style: 'profitCell' },
          {
            text: formatCurrency(diffBalance),
            style: 'profitCell',
            alignment: 'right',
          },
          emptyCell(),
          emptyCell(),
        ]);
      } else {
        body.push([
          emptyCell(),
          emptyCell(),
          { text: 'DIFFERENCE', style: 'lossCell' },
          {
            text: formatCurrency(Math.abs(diffBalance)),
            style: 'lossCell',
            alignment: 'right',
          },
        ]);
      }
    }
  }

  const lastRowIndex = body.length;
  body.push([
    { text: 'Total', style: 'tableFooter' },
    {
      text: formatCurrency(balancedTotal),
      style: 'tableFooter',
      alignment: 'right',
    },
    { text: 'Total', style: 'tableFooter' },
    {
      text: formatCurrency(balancedTotal),
      style: 'tableFooter',
      alignment: 'right',
    },
  ]);

  return {
    pageOrientation: 'landscape',
    pageMargins: [24, 28, 24, 28],
    content: [
      {
        text: 'Balance Sheet',
        style: 'title',
        alignment: 'center',
        margin: [0, 0, 0, 6],
      },
      {
        columns: [
          { text: `Firm: ${firmName || 'All Firms'}`, style: 'meta' },
          {
            text: `Period: ${periodStart} To ${periodEnd}`,
            style: 'meta',
            alignment: 'right',
          },
        ],
        margin: [0, 0, 0, 12],
      },
      {
        table: {
          headerRows: 1,
          widths: ['*', 90, '*', 90],
          body,
        },
        layout: {
          fillColor: (rowIndex) => {
            if (rowIndex === 0) return COLORS.headerBg;
            if (rowIndex === lastRowIndex) return COLORS.footerBg;
            return null;
          },
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => COLORS.border,
          vLineColor: () => COLORS.border,
          paddingLeft: () => 6,
          paddingRight: () => 6,
          paddingTop: () => 5,
          paddingBottom: () => 5,
        },
      },
    ],
    styles: {
      title: { fontSize: 16, bold: true, color: COLORS.title },
      meta: { fontSize: 10, color: COLORS.meta },
      tableHeader: { fontSize: 10, bold: true, color: COLORS.headerText },
      tableCell: { fontSize: 9, color: COLORS.cellText },
      tableFooter: { fontSize: 9, bold: true, color: COLORS.footerText },
      profitCell: { fontSize: 9, bold: true, color: COLORS.profit },
      lossCell: { fontSize: 9, bold: true, color: COLORS.loss },
    },
    defaultStyle: { font: 'Roboto' },
  };
};

const getFileName = (periodStart, periodEnd) =>
  `Balance_Sheet_${periodStart}_to_${periodEnd}.pdf`.replace(/\//g, '-');

export const downloadBalanceSheetPdf = (options) => {
  const docDefinition = buildDocDefinition(options);
  const fileName = getFileName(options.periodStart, options.periodEnd);
  pdfMake.createPdf(docDefinition).download(fileName);
  return fileName;
};

export const getBalanceSheetPdfBlob = (options) =>
  new Promise((resolve, reject) => {
    try {
      const docDefinition = buildDocDefinition(options);
      pdfMake.createPdf(docDefinition).getBlob((blob) => resolve(blob));
    } catch (error) {
      reject(error);
    }
  });

export const getBalanceSheetShareText = ({
  firmName,
  periodStart,
  periodEnd,
  data = {},
}) => {
  const { totalAssets, totalLiabilities, diffBalance, balancedTotal } =
    calculateBalanceSheetTotals(data);

  const lines = [
    'Balance Sheet Report',
    `Firm: ${firmName || 'All Firms'}`,
    `Period: ${periodStart} To ${periodEnd}`,
    `Total Liabilities: ${formatCurrency(totalLiabilities)}`,
    `Total Assets: ${formatCurrency(totalAssets)}`,
  ];

  if (diffBalance !== 0) {
    lines.push(
      diffBalance > 0
        ? `Net Profit: ${formatCurrency(diffBalance)}`
        : `Net Loss: ${formatCurrency(Math.abs(diffBalance))}`
    );
  }

  lines.push(`Balance Total: ${formatCurrency(balancedTotal)}`);
  return lines.join('\n');
};
