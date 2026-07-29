import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import {
  calculateTrialBalanceTotals,
  formatBalance,
} from './trialBalanceUtils';

pdfMake.vfs = pdfFonts.vfs || pdfFonts.default?.vfs || pdfFonts;

/* Match software theme tokens from color.css / Trial Balance table */
const COLORS = {
  title: '#8B4513', // --text-brown / brown
  meta: '#333333', // --color-black-soft
  headerBg: '#dc143c', // --btn-danger-text (bg-danger header)
  headerText: '#ffffff',
  footerBg: '#000080', // --btn-primary-text / navy (TOTAL row)
  footerText: '#ffffff',
  accountName: '#8B4513', // text-brown
  cellText: '#212529',
  altRow: '#e9eff9', // --bg-cust-primary
  footerSoft: '#eff3ff', // --datatable-row-bg-blue approx
  border: '#adb5bd',
};

const buildDocDefinition = ({ data = [], firmName, periodStart, periodEnd }) => {
  const totals = calculateTrialBalanceTotals(data);
  const lastRowIndex = data.length ? data.length + 1 : 2;

  const body = [
    [
      { text: 'ACCOUNTS DETAILS', style: 'tableHeader', alignment: 'left' },
      { text: 'OPENING BAL.', style: 'tableHeader', alignment: 'right' },
      { text: 'DEBIT AMT', style: 'tableHeader', alignment: 'right' },
      { text: 'CREDIT AMT', style: 'tableHeader', alignment: 'right' },
      { text: 'CLOSING BAL.', style: 'tableHeader', alignment: 'right' },
    ],
    ...data.map((item) => [
      { text: item.acc_name || '-', style: 'accountName' },
      { text: formatBalance(item.acc_open_balance), style: 'tableCell', alignment: 'right' },
      { text: (item.total_dr_amt || 0).toFixed(2), style: 'tableCell', alignment: 'right' },
      { text: (item.total_cr_amt || 0).toFixed(2), style: 'tableCell', alignment: 'right' },
      { text: formatBalance(item.acc_close_balance), style: 'tableCell', alignment: 'right' },
    ]),
    [
      { text: 'TOTAL', style: 'tableFooter', alignment: 'left' },
      { text: formatBalance(totals.open), style: 'tableFooter', alignment: 'right' },
      { text: totals.dr.toFixed(2), style: 'tableFooter', alignment: 'right' },
      { text: totals.cr.toFixed(2), style: 'tableFooter', alignment: 'right' },
      { text: formatBalance(totals.close), style: 'tableFooter', alignment: 'right' },
    ],
  ];

  if (!data.length) {
    body.splice(1, 0, [
      {
        text: 'No records found for the selected period.',
        colSpan: 5,
        alignment: 'center',
        style: 'tableCell',
        margin: [0, 8, 0, 8],
      },
      {},
      {},
      {},
      {},
    ]);
  }

  return {
    pageOrientation: 'landscape',
    pageMargins: [24, 28, 24, 28],
    content: [
      {
        text: 'Trial Balance',
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
          widths: ['*', 90, 80, 80, 90],
          body,
        },
        layout: {
          fillColor: (rowIndex) => {
            if (rowIndex === 0) return COLORS.headerBg;
            if (rowIndex === lastRowIndex) return COLORS.footerBg;
            return rowIndex % 2 === 0 ? COLORS.altRow : null;
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
      tableHeader: { fontSize: 9, bold: true, color: COLORS.headerText },
      accountName: { fontSize: 9, bold: true, color: COLORS.accountName },
      tableCell: { fontSize: 9, color: COLORS.cellText },
      tableFooter: { fontSize: 9, bold: true, color: COLORS.footerText },
    },
    defaultStyle: { font: 'Roboto' },
  };
};

const getFileName = (periodStart, periodEnd) =>
  `Trial_Balance_${periodStart}_to_${periodEnd}.pdf`.replace(/\//g, '-');

export const downloadTrialBalancePdf = (options) => {
  const docDefinition = buildDocDefinition(options);
  const fileName = getFileName(options.periodStart, options.periodEnd);
  pdfMake.createPdf(docDefinition).download(fileName);
  return fileName;
};

export const getTrialBalancePdfBlob = (options) =>
  new Promise((resolve, reject) => {
    try {
      const docDefinition = buildDocDefinition(options);
      pdfMake.createPdf(docDefinition).getBlob((blob) => resolve(blob));
    } catch (error) {
      reject(error);
    }
  });

export const getTrialBalanceShareText = ({ firmName, periodStart, periodEnd, data = [] }) => {
  const totals = calculateTrialBalanceTotals(data);
  return [
    'Trial Balance Report',
    `Firm: ${firmName || 'All Firms'}`,
    `Period: ${periodStart} To ${periodEnd}`,
    `Opening: ${formatBalance(totals.open)}`,
    `Debit: ${totals.dr.toFixed(2)}`,
    `Credit: ${totals.cr.toFixed(2)}`,
    `Closing: ${formatBalance(totals.close)}`,
  ].join('\n');
};
