import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import {
  calculateDayBookSummary,
  calculateSectionTotals,
  calculateProcessingSectionTotals,
  calculateFirstMonthInterestSectionTotals,
  formatCurrency,
  getRowAmounts,
  getProcessingRowAmounts,
  getFirstMonthInterestRowAmounts,
  isProcessingDaybookSection,
  isFirstMonthInterestDaybookSection,
} from './dayBookUtils';

pdfMake.vfs = pdfFonts.vfs || pdfFonts.default?.vfs || pdfFonts;

const COLORS = {
  title: '#8B4513',
  meta: '#333333',
  headerBg: '#f8d7da',
  headerText: '#8B4513',
  footerBg: '#eaf4f3',
  footerText: '#212529',
  sectionBg: '#e9eff9',
  cellText: '#212529',
  border: '#adb5bd',
  cr: '#dc143c',
  dr: '#006400',
};

const money = (val) => formatCurrency(val);

const buildProcessingSectionTable = (title, data = []) => {
  const totals = calculateProcessingSectionTotals(data);
  const body = [
    [
      { text: 'DATE', style: 'tableHeader', alignment: 'left' },
      { text: 'FIRM', style: 'tableHeader', alignment: 'left' },
      { text: 'CUSTOMER NAME', style: 'tableHeader', alignment: 'left' },
      { text: 'REF NO', style: 'tableHeader', alignment: 'left' },
      { text: 'TYPE', style: 'tableHeader', alignment: 'left' },
      { text: 'CASH', style: 'tableHeader', alignment: 'right' },
      { text: 'BANK', style: 'tableHeader', alignment: 'right' },
      { text: 'ONLINE', style: 'tableHeader', alignment: 'right' },
      { text: 'CARD', style: 'tableHeader', alignment: 'right' },
      { text: 'DISC', style: 'tableHeader', alignment: 'right' },
      { text: 'TOTAL', style: 'tableHeader', alignment: 'right' },
    ],
  ];

  data.forEach((item) => {
    const row = getProcessingRowAmounts(item);
    body.push([
      { text: item.db_date || '-', style: 'tableCell' },
      { text: item.db_firm || '-', style: 'tableCell' },
      { text: item.db_customer_name || '-', style: 'accountName' },
      { text: item.db_ref_no || '-', style: 'tableCell' },
      { text: item.db_ref_type || '-', style: 'tableCell' },
      { text: money(row.cash), style: 'tableCell', alignment: 'right', color: COLORS.dr },
      { text: money(row.bank), style: 'tableCell', alignment: 'right', color: COLORS.dr },
      { text: money(row.online), style: 'tableCell', alignment: 'right', color: COLORS.dr },
      { text: money(row.card), style: 'tableCell', alignment: 'right', color: COLORS.dr },
      { text: money(row.disc), style: 'tableCell', alignment: 'right', color: COLORS.dr },
      { text: money(row.total), style: 'tableCellBold', alignment: 'right', color: COLORS.dr },
    ]);
  });

  const footerIndex = body.length;
  body.push([
    { text: 'TOTAL AMT :', style: 'tableFooter', colSpan: 5, alignment: 'right' },
    {},
    {},
    {},
    {},
    { text: money(totals.cash), style: 'tableFooter', alignment: 'right', color: COLORS.dr },
    { text: money(totals.bank), style: 'tableFooter', alignment: 'right', color: COLORS.dr },
    { text: money(totals.online), style: 'tableFooter', alignment: 'right', color: COLORS.dr },
    { text: money(totals.card), style: 'tableFooter', alignment: 'right', color: COLORS.dr },
    { text: money(totals.disc), style: 'tableFooter', alignment: 'right', color: COLORS.dr },
    { text: money(totals.total), style: 'tableFooter', alignment: 'right', color: COLORS.dr },
  ]);

  return {
    stack: [
      {
        text: title,
        style: 'sectionTitle',
        margin: [0, 0, 0, 6],
      },
      {
        table: {
          headerRows: 1,
          widths: [50, 60, '*', 60, 40, 42, 42, 42, 42, 38, 48],
          body,
          dontBreakRows: true,
        },
        layout: {
          fillColor: (rowIndex) => {
            if (rowIndex === 0) return COLORS.headerBg;
            if (rowIndex === footerIndex) return COLORS.footerBg;
            return null;
          },
          hLineColor: () => COLORS.border,
          vLineColor: () => COLORS.border,
        },
      },
    ],
    margin: [0, 0, 0, 10],
  };
};

const buildFirstMonthInterestSectionTable = (title, data = []) => {
  const totals = calculateFirstMonthInterestSectionTotals(data);
  const body = [
    [
      { text: 'DATE', style: 'tableHeader', alignment: 'left' },
      { text: 'FIRM', style: 'tableHeader', alignment: 'left' },
      { text: 'CUSTOMER NAME', style: 'tableHeader', alignment: 'left' },
      { text: 'REF NO', style: 'tableHeader', alignment: 'left' },
      { text: 'TYPE', style: 'tableHeader', alignment: 'left' },
      { text: 'CASH', style: 'tableHeader', alignment: 'right' },
      { text: 'BANK', style: 'tableHeader', alignment: 'right' },
      { text: 'ONLINE', style: 'tableHeader', alignment: 'right' },
      { text: 'CARD', style: 'tableHeader', alignment: 'right' },
      { text: 'DISC', style: 'tableHeader', alignment: 'right' },
      { text: 'TOTAL', style: 'tableHeader', alignment: 'right' },
    ],
  ];

  data.forEach((item) => {
    const row = getFirstMonthInterestRowAmounts(item);
    body.push([
      { text: item.db_date || '-', style: 'tableCell' },
      { text: item.db_firm || '-', style: 'tableCell' },
      { text: item.db_customer_name || '-', style: 'accountName' },
      { text: item.db_ref_no || '-', style: 'tableCell' },
      { text: item.db_ref_type || '-', style: 'tableCell' },
      { text: money(row.cash), style: 'tableCell', alignment: 'right', color: COLORS.dr },
      { text: money(row.bank), style: 'tableCell', alignment: 'right', color: COLORS.dr },
      { text: money(row.online), style: 'tableCell', alignment: 'right', color: COLORS.dr },
      { text: money(row.card), style: 'tableCell', alignment: 'right', color: COLORS.dr },
      { text: money(row.disc), style: 'tableCell', alignment: 'right', color: COLORS.dr },
      { text: money(row.total), style: 'tableCellBold', alignment: 'right', color: COLORS.dr },
    ]);
  });

  const footerIndex = body.length;
  body.push([
    { text: 'TOTAL AMT :', style: 'tableFooter', colSpan: 5, alignment: 'right' },
    {},
    {},
    {},
    {},
    { text: money(totals.cash), style: 'tableFooter', alignment: 'right', color: COLORS.dr },
    { text: money(totals.bank), style: 'tableFooter', alignment: 'right', color: COLORS.dr },
    { text: money(totals.online), style: 'tableFooter', alignment: 'right', color: COLORS.dr },
    { text: money(totals.card), style: 'tableFooter', alignment: 'right', color: COLORS.dr },
    { text: money(totals.disc), style: 'tableFooter', alignment: 'right', color: COLORS.dr },
    { text: money(totals.total), style: 'tableFooter', alignment: 'right', color: COLORS.dr },
  ]);

  return {
    stack: [
      {
        text: title,
        style: 'sectionTitle',
        margin: [0, 0, 0, 6],
      },
      {
        table: {
          headerRows: 1,
          widths: [50, 60, '*', 60, 40, 42, 42, 42, 42, 38, 48],
          body,
          dontBreakRows: true,
        },
        layout: {
          fillColor: (rowIndex) => {
            if (rowIndex === 0) return COLORS.headerBg;
            if (rowIndex === footerIndex) return COLORS.footerBg;
            return null;
          },
          hLineColor: () => COLORS.border,
          vLineColor: () => COLORS.border,
        },
      },
    ],
    margin: [0, 0, 0, 10],
  };
};

const buildSectionTable = (title, data = [], amtTone = 'cr') => {
  const totals = calculateSectionTotals(data);
  const body = [
    [
      { text: 'DATE', style: 'tableHeader', alignment: 'left' },
      { text: 'FIRM', style: 'tableHeader', alignment: 'left' },
      { text: 'CUSTOMER NAME', style: 'tableHeader', alignment: 'left' },
      { text: 'CASH', style: 'tableHeader', alignment: 'right' },
      { text: 'BANK', style: 'tableHeader', alignment: 'right' },
      { text: 'ONLINE', style: 'tableHeader', alignment: 'right' },
      { text: 'CARD', style: 'tableHeader', alignment: 'right' },
      { text: 'DISC', style: 'tableHeader', alignment: 'right' },
      { text: 'TOTAL', style: 'tableHeader', alignment: 'right' },
    ],
  ];

  data.forEach((item) => {
    const row = getRowAmounts(item);
    body.push([
      { text: item.db_date || '-', style: 'tableCell' },
      { text: item.db_firm || '-', style: 'tableCell' },
      { text: item.db_customer_name || '-', style: 'accountName' },
      { text: money(row.cash), style: 'tableCell', alignment: 'right' },
      { text: money(row.bank), style: 'tableCell', alignment: 'right' },
      { text: money(row.online), style: 'tableCell', alignment: 'right' },
      { text: money(row.card), style: 'tableCell', alignment: 'right' },
      {
        text: money(row.disc),
        style: 'tableCell',
        alignment: 'right',
        color: amtTone === 'dr' ? COLORS.dr : COLORS.cr,
      },
      {
        text: money(row.total),
        style: 'tableCellBold',
        alignment: 'right',
        color: amtTone === 'dr' ? COLORS.dr : COLORS.cr,
      },
    ]);
  });

  const footerIndex = body.length;
  body.push([
    { text: 'TOTAL AMT :', style: 'tableFooter', colSpan: 3, alignment: 'right' },
    {},
    {},
    { text: money(totals.cash), style: 'tableFooter', alignment: 'right' },
    { text: money(totals.bank), style: 'tableFooter', alignment: 'right' },
    { text: money(totals.online), style: 'tableFooter', alignment: 'right' },
    { text: money(totals.card), style: 'tableFooter', alignment: 'right' },
    { text: money(totals.disc), style: 'tableFooter', alignment: 'right' },
    { text: money(totals.total), style: 'tableFooter', alignment: 'right' },
  ]);

  return {
    stack: [
      {
        text: title,
        style: 'sectionTitle',
        margin: [0, 0, 0, 6],
      },
      {
        table: {
          headerRows: 1,
          widths: [55, 70, '*', 48, 48, 48, 48, 48, 55],
          body,
          dontBreakRows: true,
        },
        layout: {
          fillColor: (rowIndex) => {
            if (rowIndex === 0) return COLORS.headerBg;
            if (rowIndex === footerIndex) return COLORS.footerBg;
            return null;
          },
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => COLORS.border,
          vLineColor: () => COLORS.border,
          paddingLeft: () => 4,
          paddingRight: () => 4,
          paddingTop: () => 4,
          paddingBottom: () => 4,
        },
      },
    ],
    margin: [0, 0, 0, 14],
  };
};

const buildSummaryTable = (keyedDaybookData, openingData) => {
  const s = calculateDayBookSummary(keyedDaybookData, openingData);
  const row = (label, modes, color) => [
    { text: label, style: 'tableCellBold', alignment: 'right', color },
    { text: money(modes.cash), style: 'tableCell', alignment: 'right', color },
    { text: money(modes.bank), style: 'tableCell', alignment: 'right', color },
    { text: money(modes.online), style: 'tableCell', alignment: 'right', color },
    { text: money(modes.card), style: 'tableCell', alignment: 'right', color },
    { text: money(modes.disc), style: 'tableCell', alignment: 'right', color },
    { text: money(modes.total), style: 'tableCellBold', alignment: 'right', color },
  ];

  const body = [
    [
      { text: '', style: 'tableHeader' },
      { text: 'CASH', style: 'tableHeader', alignment: 'right' },
      { text: 'BANK', style: 'tableHeader', alignment: 'right' },
      { text: 'ONLINE', style: 'tableHeader', alignment: 'right' },
      { text: 'CARD', style: 'tableHeader', alignment: 'right' },
      { text: 'DISCOUNT', style: 'tableHeader', alignment: 'right' },
      { text: 'TOTAL', style: 'tableHeader', alignment: 'right' },
    ],
    row('AMOUNT IN:', s.in, COLORS.dr),
    row('AMOUNT OUT:', s.out, COLORS.cr),
    row('TODAY TOTAL:', s.today, COLORS.title),
    row('OPENING BALANCE:', s.opening, COLORS.cellText),
    row('TODAY TOTAL:', s.today, COLORS.title),
    row('CLOSING AMOUNT:', s.closing, COLORS.cellText),
    [
      { text: 'FINAL TOTAL :', style: 'tableFooter', alignment: 'right' },
      {
        text: `CR : ${money(s.finalCr)}`,
        style: 'tableFooter',
        colSpan: 2,
        alignment: 'center',
        color: COLORS.cr,
      },
      {},
      {
        text: `DR : ${money(s.finalDr)}`,
        style: 'tableFooter',
        colSpan: 2,
        alignment: 'center',
        color: COLORS.dr,
      },
      {},
      {
        text: money(s.finalTotal),
        style: 'tableFooter',
        colSpan: 2,
        alignment: 'center',
      },
      {},
    ],
  ];

  return {
    table: {
      headerRows: 1,
      widths: [90, '*', '*', '*', '*', '*', '*'],
      body,
    },
    layout: {
      fillColor: (rowIndex) => {
        if (rowIndex === 0) return COLORS.headerBg;
        if (rowIndex === body.length - 1) return '#dfe7ff';
        return null;
      },
      hLineWidth: () => 0.5,
      vLineWidth: () => 0.5,
      hLineColor: () => COLORS.border,
      vLineColor: () => COLORS.border,
      paddingLeft: () => 4,
      paddingRight: () => 4,
      paddingTop: () => 4,
      paddingBottom: () => 4,
    },
  };
};

const buildDocDefinition = ({
  panels = [],
  keyedDaybookData = {},
  openingData = {},
  firmName,
  periodStart,
  periodEnd,
  openingDisplay,
}) => {
  const content = [
    {
      text: 'DAILY DAIRY',
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
      margin: [0, 0, 0, 4],
    },
    {
      columns: [
        { text: 'CR AMOUNT  |  DR AMOUNT', style: 'meta' },
        {
          text: `Opening Balance: ${openingDisplay || money(openingData.total_open_amt || 0)}`,
          style: 'meta',
          alignment: 'right',
        },
      ],
      margin: [0, 0, 0, 12],
    },
  ];

  if (!panels.length) {
    content.push({
      text: 'No records found for the selected period.',
      alignment: 'center',
      margin: [0, 20, 0, 0],
      style: 'meta',
    });
  } else {
    panels.forEach((panel) => {
      if (isProcessingDaybookSection(panel.title)) {
        content.push(buildProcessingSectionTable(panel.title, panel.data));
      } else if (isFirstMonthInterestDaybookSection(panel.title)) {
        content.push(buildFirstMonthInterestSectionTable(panel.title, panel.data));
      } else {
        content.push(buildSectionTable(panel.title, panel.data, panel.amtTone));
      }
    });
  }

  content.push({
    text: 'Summary',
    style: 'sectionTitle',
    margin: [0, 6, 0, 6],
  });
  content.push(buildSummaryTable(keyedDaybookData, openingData));

  return {
    pageOrientation: 'landscape',
    pageSize: 'A4',
    pageMargins: [20, 24, 20, 24],
    content,
    styles: {
      title: { fontSize: 16, bold: true, color: COLORS.title },
      meta: { fontSize: 9, color: COLORS.meta },
      sectionTitle: { fontSize: 11, bold: true, color: COLORS.title },
      tableHeader: { fontSize: 8, bold: true, color: COLORS.headerText },
      accountName: { fontSize: 8, bold: true, color: COLORS.title },
      tableCell: { fontSize: 8, color: COLORS.cellText },
      tableCellBold: { fontSize: 8, bold: true, color: COLORS.cellText },
      tableFooter: { fontSize: 8, bold: true, color: COLORS.footerText },
    },
    defaultStyle: { font: 'Roboto' },
  };
};

const getFileName = (periodStart, periodEnd) =>
  `Daily_Dairy_${periodStart}_to_${periodEnd}.pdf`.replace(/\//g, '-');

export const downloadDayBookPdf = (options) => {
  const docDefinition = buildDocDefinition(options);
  const fileName = getFileName(options.periodStart, options.periodEnd);
  pdfMake.createPdf(docDefinition).download(fileName);
  return fileName;
};

export const getDayBookPdfBlob = (options) =>
  new Promise((resolve, reject) => {
    try {
      const docDefinition = buildDocDefinition(options);
      pdfMake.createPdf(docDefinition).getBlob((blob) => resolve(blob));
    } catch (error) {
      reject(error);
    }
  });

export const getDayBookShareText = ({
  firmName,
  periodStart,
  periodEnd,
  keyedDaybookData = {},
  openingData = {},
}) => {
  const s = calculateDayBookSummary(keyedDaybookData, openingData);
  return [
    'Daily Dairy Report',
    `Firm: ${firmName || 'All Firms'}`,
    `Period: ${periodStart} To ${periodEnd}`,
    `Opening: ${money(s.opening.total)}`,
    `Amount In: ${money(s.in.total)}`,
    `Amount Out: ${money(s.out.total)}`,
    `Closing: ${money(s.closing.total)}`,
    `CR: ${money(s.finalCr)} | DR: ${money(s.finalDr)}`,
    `Final: ${money(s.finalTotal)}`,
  ].join('\n');
};
