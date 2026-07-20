import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { buildLoanInvoiceData } from './buildLoanInvoiceData';

pdfMake.vfs = pdfFonts.vfs || pdfFonts.default?.vfs || pdfFonts;

const C = {
  navy: '#12263a',
  navySoft: '#f0f4f8',
  gold: '#b08900',
  goldSoft: '#faf6eb',
  text: '#243447',
  muted: '#6b7c8f',
  line: '#e2e8f0',
  white: '#ffffff',
  green: '#0f766e',
  greenSoft: '#ecfdf5',
  red: '#b91c1c',
  blueSoft: '#e8f1fb',
  blueText: '#1e40af',
  amberSoft: '#fff7ed',
  amberText: '#9a3412',
  roseSoft: '#fef2f2',
};

const money = (v) => `Rs. ${v || '0.00'}`;

const tableLayout = {
  hLineWidth: (i, node) => (i === 0 || i === 1 || i === node.table.body.length ? 0.8 : 0.4),
  vLineWidth: () => 0,
  hLineColor: (i) => (i === 0 || i === 1 ? C.navy : C.line),
  paddingLeft: () => 6,
  paddingRight: () => 6,
  paddingTop: () => 4,
  paddingBottom: () => 4,
};

const th = (text, align = 'left') => ({
  text,
  bold: true,
  fontSize: 7,
  color: C.white,
  fillColor: C.navy,
  alignment: align,
});

const td = (text, opts = {}) => ({
  text: text ?? '-',
  fontSize: 7.5,
  color: opts.color || C.text,
  bold: !!opts.bold,
  alignment: opts.align || 'left',
  fillColor: opts.fill || null,
});

const section = (title) => ({
  text: title,
  bold: true,
  fontSize: 9,
  color: C.navy,
  margin: [0, 10, 0, 4],
});

const typeBadge = (type) => {
  const map = {
    Deposit: { bg: C.greenSoft, color: C.green },
    'Additional Principal': { bg: C.amberSoft, color: C.amberText },
    'Release Loan': { bg: C.roseSoft, color: C.red },
    'Transfer Loan': { bg: C.navySoft, color: C.navy },
    'Opening Balance': { bg: C.blueSoft, color: C.blueText },
  };
  const s = map[type] || { bg: C.navySoft, color: C.navy };
  return {
    text: type,
    fontSize: 6.5,
    bold: true,
    color: s.color,
    fillColor: s.bg,
    alignment: 'center',
  };
};

/**
 * Clean, attractive single-page loan invoice.
 */
export const downloadLoanInvoicePdf = (loanDetails, customer = null) => {
  const data = buildLoanInvoiceData(loanDetails, customer);
  if (!data) throw new Error('Unable to build invoice data');

  const {
    firm,
    customer: cust,
    meta,
    status,
    isUnsecured,
    loan,
    items,
    itemsTotal,
    transactions,
    transfer,
    summary,
  } = data;

  const firmInitials = (firm?.name || 'FL')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

  const isReleased = status === 'RELEASED';
  const isTransferred = status === 'TRANSFERRED';
  const statusColor = isReleased ? C.red : isTransferred ? C.navy : C.green;
  const statusBg = isReleased ? C.roseSoft : isTransferred ? C.navySoft : C.greenSoft;

  // ---- Items ----
  const itemBody = [
    [
      th('Metal'),
      th('Item'),
      th('Qty', 'center'),
      th('GS WT', 'right'),
      th('NT WT', 'right'),
      th('Purity', 'center'),
      th('FN WT', 'right'),
      th('Valuation', 'right'),
    ],
  ];

  if (items?.length) {
    items.forEach((item, i) => {
      const fill = i % 2 ? C.navySoft : C.white;
      itemBody.push([
        td(item.metalType, { fill }),
        td(item.description, { fill }),
        td(String(item.quantity), { align: 'center', fill }),
        td(item.gsWeight, { align: 'right', fill }),
        td(item.ntWeight, { align: 'right', fill }),
        td(String(item.purity), { align: 'center', fill }),
        td(String(item.fineWeight), { align: 'right', fill }),
        td(item.valuation, { align: 'right', fill, bold: true }),
      ]);
    });
    itemBody.push([
      {
        text: 'Total',
        colSpan: 4,
        bold: true,
        fontSize: 7.5,
        color: C.navy,
        fillColor: C.goldSoft,
      },
      {},
      {},
      {},
      {
        text: itemsTotal?.weight || '-',
        colSpan: 3,
        alignment: 'right',
        bold: true,
        fontSize: 7.5,
        color: C.navy,
        fillColor: C.goldSoft,
      },
      {},
      {},
      {
        text: money(itemsTotal?.valuation),
        alignment: 'right',
        bold: true,
        fontSize: 7.5,
        color: C.gold,
        fillColor: C.goldSoft,
      },
    ]);
  } else {
    itemBody.push([
      {
        text: 'No mortgaged items',
        colSpan: 8,
        alignment: 'center',
        italics: true,
        color: C.muted,
        fontSize: 7.5,
        fillColor: C.navySoft,
      },
      {},
      {},
      {},
      {},
      {},
      {},
      {},
    ]);
  }

  // ---- Transactions ----
  const txnBody = [
    [
      th('Date'),
      th('Type'),
      th('Description'),
      th('Mode'),
      th('Principal', 'right'),
      th('Interest', 'right'),
      th('Balance', 'right'),
    ],
  ];

  if (transactions?.length) {
    transactions.forEach((txn, i) => {
      const fill = i % 2 ? C.navySoft : C.white;
      const badge = typeBadge(txn.type);
      txnBody.push([
        td(txn.date, { fill }),
        badge,
        td(txn.description, { fill }),
        td(txn.paymentMode, { fill }),
        td(txn.principal, { align: 'right', fill }),
        td(txn.interest, { align: 'right', fill }),
        td(txn.balance, { align: 'right', fill, bold: true, color: C.navy }),
      ]);
    });
  } else {
    txnBody.push([
      {
        text: 'No transactions',
        colSpan: 7,
        alignment: 'center',
        italics: true,
        color: C.muted,
        fontSize: 7.5,
        fillColor: C.navySoft,
      },
      {},
      {},
      {},
      {},
      {},
      {},
    ]);
  }

  // ---- Summary rows ----
  const sumRow = (label, value, opts = {}) => [
    {
      text: label,
      fontSize: 7.5,
      color: opts.strong ? C.navy : C.muted,
      bold: !!opts.strong,
      fillColor: opts.fill || null,
      margin: [2, 1, 2, 1],
    },
    {
      text: typeof value === 'object' ? value.text : value,
      alignment: 'right',
      fontSize: opts.strong ? 9 : 7.5,
      bold: true,
      color: (typeof value === 'object' && value.color) || (opts.strong ? C.navy : C.text),
      fillColor: opts.fill || null,
      margin: [2, 1, 2, 1],
    },
  ];

  const summaryBody = [
    [
      {
        text: 'TOTAL SUMMARY',
        colSpan: 2,
        alignment: 'center',
        bold: true,
        color: C.white,
        fillColor: C.navy,
        fontSize: 8,
        margin: [0, 3, 0, 3],
      },
      {},
    ],
    sumRow('Principal Paid', money(summary.totalPrincipalPaid)),
    sumRow('Outstanding Principal', money(summary.outstandingPrincipal)),
    sumRow('Total Interest', money(summary.totalInterest)),
    sumRow('Interest Paid', money(summary.totalInterestPaid)),
    sumRow('Interest Due', money(summary.totalInterestDue)),
  ];

  if (!isUnsecured) {
    summaryBody.push(sumRow('Items Valuation', money(summary.totalValuation)));
    summaryBody.push(
      sumRow('Profit / Loss', {
        text: `${summary.profitLossSign}${summary.profitLoss}`,
        color: summary.profitLossRaw >= 0 ? C.green : C.red,
      })
    );
  }

  summaryBody.push(
    sumRow('Total Payable Amount', money(summary.totalPayable), {
      strong: true,
      fill: C.goldSoft,
    })
  );

  const content = [
    // ===== HEADER =====
    {
      columns: [
        {
          width: 38,
          table: {
            widths: [34],
            body: [
              [
                {
                  text: firmInitials || 'FL',
                  alignment: 'center',
                  bold: true,
                  fontSize: 12,
                  color: C.white,
                  fillColor: C.gold,
                  margin: [0, 7, 0, 7],
                },
              ],
            ],
          },
          layout: 'noBorders',
        },
        {
          width: '*',
          stack: [
            {
              text: (firm.name || 'FIRM').toUpperCase(),
              bold: true,
              fontSize: 15,
              color: C.navy,
              margin: [8, 1, 0, 0],
            },
            {
              text: 'Loan Statement / Invoice',
              fontSize: 8,
              color: C.gold,
              margin: [8, 2, 0, 0],
            },
          ],
        },
        {
          width: 118,
          stack: [
            { text: 'Statement Date', fontSize: 6.5, color: C.muted, alignment: 'right' },
            {
              text: meta.statementDate,
              bold: true,
              fontSize: 11,
              color: C.navy,
              alignment: 'right',
              margin: [0, 2, 0, 0],
            },
          ],
          margin: [0, 2, 0, 0],
        },
      ],
      columnGap: 6,
      margin: [0, 0, 0, 6],
    },

    // Gold + navy divider
    {
      canvas: [
        { type: 'line', x1: 0, y1: 0, x2: 555, y2: 0, lineWidth: 1.5, lineColor: C.navy },
        { type: 'line', x1: 0, y1: 2.5, x2: 90, y2: 2.5, lineWidth: 2, lineColor: C.gold },
      ],
      margin: [0, 0, 0, 10],
    },

    // ===== FIRM / CUSTOMER CARDS =====
    {
      columns: [
        {
          width: '*',
          table: {
            widths: [58, '*'],
            body: [
              [
                {
                  text: 'FIRM DETAILS',
                  colSpan: 2,
                  bold: true,
                  fontSize: 7.5,
                  color: C.white,
                  fillColor: C.navy,
                  alignment: 'left',
                  margin: [6, 4, 6, 4],
                  characterSpacing: 0.4,
                },
                {},
              ],
              [
                { text: 'Name', fontSize: 7, color: C.muted, fillColor: C.navySoft, margin: [6, 3, 4, 3] },
                { text: firm.name || '-', bold: true, fontSize: 8, color: C.navy, fillColor: C.navySoft, margin: [2, 3, 6, 3] },
              ],
              [
                { text: 'Address', fontSize: 7, color: C.muted, margin: [6, 3, 4, 3] },
                { text: firm.address || '-', fontSize: 7.5, color: C.text, margin: [2, 3, 6, 3] },
              ],
              [
                { text: 'Phone', fontSize: 7, color: C.muted, fillColor: C.navySoft, margin: [6, 3, 4, 3] },
                { text: firm.phone || '-', fontSize: 7.5, color: C.text, fillColor: C.navySoft, margin: [2, 3, 6, 3] },
              ],
              [
                { text: 'Email', fontSize: 7, color: C.muted, margin: [6, 3, 4, 3] },
                { text: firm.email || '-', fontSize: 7.5, color: C.text, margin: [2, 3, 6, 3] },
              ],
              [
                { text: 'Website', fontSize: 7, color: C.muted, fillColor: C.navySoft, margin: [6, 3, 4, 3] },
                { text: firm.website || '-', fontSize: 7.5, color: C.text, fillColor: C.navySoft, margin: [2, 3, 6, 3] },
              ],
            ],
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => C.line,
            vLineColor: () => C.line,
            paddingLeft: () => 0,
            paddingRight: () => 0,
            paddingTop: () => 0,
            paddingBottom: () => 0,
          },
        },
        {
          width: '*',
          table: {
            widths: [72, '*'],
            body: [
              [
                {
                  text: 'CUSTOMER DETAILS',
                  colSpan: 2,
                  bold: true,
                  fontSize: 7.5,
                  color: C.white,
                  fillColor: C.gold,
                  alignment: 'left',
                  margin: [6, 4, 6, 4],
                  characterSpacing: 0.4,
                },
                {},
              ],
              [
                { text: 'Name', fontSize: 7, color: C.muted, fillColor: C.goldSoft, margin: [6, 3, 4, 3] },
                { text: cust.name || '-', bold: true, fontSize: 8, color: C.navy, fillColor: C.goldSoft, margin: [2, 3, 6, 3] },
              ],
              [
                { text: 'Address', fontSize: 7, color: C.muted, margin: [6, 3, 4, 3] },
                { text: cust.address || '-', fontSize: 7.5, color: C.text, margin: [2, 3, 6, 3] },
              ],
              [
                { text: 'Account ID', fontSize: 7, color: C.muted, fillColor: C.goldSoft, margin: [6, 3, 4, 3] },
                { text: String(cust.accountId || '-'), fontSize: 7.5, color: C.text, fillColor: C.goldSoft, margin: [2, 3, 6, 3] },
              ],
              [
                { text: 'Mobile', fontSize: 7, color: C.muted, margin: [6, 3, 4, 3] },
                { text: cust.mobile || '-', fontSize: 7.5, color: C.text, margin: [2, 3, 6, 3] },
              ],
              [
                { text: 'Loan Ref', fontSize: 7, color: C.muted, fillColor: C.goldSoft, margin: [6, 3, 4, 3] },
                { text: String(meta.loanRef || '-'), fontSize: 7.5, color: C.text, fillColor: C.goldSoft, margin: [2, 3, 6, 3] },
              ],
            ],
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => C.line,
            vLineColor: () => C.line,
            paddingLeft: () => 0,
            paddingRight: () => 0,
            paddingTop: () => 0,
            paddingBottom: () => 0,
          },
        },
      ],
      columnGap: 10,
      margin: [0, 0, 0, 10],
    },

    // ===== STATUS =====
    {
      columns: [
        { width: '*', text: '' },
        {
          width: 'auto',
          table: {
            body: [
              [
                {
                  text: `CURRENT LOAN STATUS: ${status}`,
                  bold: true,
                  fontSize: 8,
                  color: statusColor,
                  fillColor: statusBg,
                  alignment: 'center',
                  margin: [16, 5, 16, 5],
                },
              ],
            ],
          },
          layout: 'noBorders',
        },
        { width: '*', text: '' },
      ],
      margin: [0, 0, 0, 8],
    },

    // ===== META ROW =====
    {
      table: {
        widths: ['*', '*', '*', '*'],
        body: [
          [
            {
              stack: [
                { text: 'PACKET NO', fontSize: 6, color: C.muted },
                { text: meta.packetNo || '-', bold: true, fontSize: 8, color: C.navy, margin: [0, 2, 0, 0] },
              ],
              fillColor: C.navySoft,
              margin: [6, 5, 6, 5],
            },
            {
              stack: [
                { text: 'LOCKER NO', fontSize: 6, color: C.muted },
                { text: meta.lockerNo || '-', bold: true, fontSize: 8, color: C.navy, margin: [0, 2, 0, 0] },
              ],
              fillColor: C.navySoft,
              margin: [6, 5, 6, 5],
            },
            {
              stack: [
                { text: 'INTEREST METHOD', fontSize: 6, color: C.muted },
                { text: loan.interestMethod || '-', bold: true, fontSize: 8, color: C.navy, margin: [0, 2, 0, 0] },
              ],
              fillColor: C.navySoft,
              margin: [6, 5, 6, 5],
            },
            {
              stack: [
                { text: 'INTEREST OPTION', fontSize: 6, color: C.muted },
                { text: loan.roiType || '-', bold: true, fontSize: 8, color: C.navy, margin: [0, 2, 0, 0] },
              ],
              fillColor: C.navySoft,
              margin: [6, 5, 6, 5],
            },
          ],
        ],
      },
      layout: {
        hLineWidth: () => 0,
        vLineWidth: () => 3,
        vLineColor: () => C.white,
        paddingLeft: () => 0,
        paddingRight: () => 0,
        paddingTop: () => 0,
        paddingBottom: () => 0,
      },
      margin: [0, 0, 0, 2],
    },

    // ===== LOAN DETAILS =====
    section('Loan Details'),
    {
      table: {
        widths: ['*', 58, 70, 70, 58, 52, 58],
        body: [
          [
            th('Loan No'),
            th('Date'),
            th('Rate of Interest'),
            th('Principal', 'right'),
            th('Processing', 'right'),
            th('Charges', 'right'),
            th('Period', 'center'),
          ],
          [
            td(loan.loanNumber, { bold: true, color: C.navy }),
            td(loan.startDate),
            td(loan.roi, { bold: true, color: C.gold }),
            td(money(loan.originalPrincipal), { align: 'right', bold: true }),
            td(money(loan.processingAmt), { align: 'right' }),
            td(money(loan.chargeAmt), { align: 'right' }),
            td(loan.timePeriod, { align: 'center' }),
          ],
        ],
      },
      layout: tableLayout,
    },
  ];

  if (!isUnsecured) {
    content.push(section('Stock Available / Mortgaged Items'));
    content.push({
      table: {
        widths: [40, '*', 28, 42, 42, 36, 36, 62],
        body: itemBody,
      },
      layout: tableLayout,
    });
  }

  content.push(section('Transaction Details'));
  content.push({
    table: {
      widths: [52, 72, '*', 42, 52, 48, 52],
      body: txnBody,
    },
    layout: tableLayout,
  });

  if (transfer) {
    content.push({
      margin: [0, 8, 0, 0],
      table: {
        widths: ['*'],
        body: [
          [
            {
              stack: [
                { text: 'Transfer Loan Details', bold: true, fontSize: 8, color: C.navy },
                { text: transfer.info || '-', fontSize: 7.5, color: C.text, margin: [0, 2, 0, 2] },
                {
                  text: `Target Firm ID: ${transfer.targetFirmId}    |    New Loan ID: ${transfer.newLoanId}`,
                  fontSize: 7,
                  color: C.muted,
                },
              ],
              fillColor: C.navySoft,
              margin: [8, 6, 8, 6],
            },
          ],
        ],
      },
      layout: 'noBorders',
    });
  }

  // ===== SUMMARY (right aligned, clean) =====
  content.push({
    margin: [0, 12, 0, 0],
    columns: [
      {
        width: '*',
        stack: [
          { text: 'Notes', bold: true, fontSize: 7.5, color: C.muted, margin: [0, 0, 0, 3] },
          {
            text: 'This statement reflects the current loan position including deposits, additional principal, release and transfer transactions.',
            fontSize: 7,
            color: C.muted,
            lineHeight: 1.3,
          },
          {
            text: `Generated on ${meta.generatedOn}`,
            fontSize: 7,
            color: C.muted,
            margin: [0, 8, 0, 0],
          },
        ],
        margin: [0, 4, 12, 0],
      },
      {
        width: 220,
        table: {
          widths: ['*', 78],
          body: summaryBody,
        },
        layout: {
          hLineWidth: (i, node) => (i === 0 || i === 1 || i === node.table.body.length ? 0 : 0.4),
          vLineWidth: () => 0,
          hLineColor: () => C.line,
          paddingLeft: () => 8,
          paddingRight: () => 8,
          paddingTop: () => 4,
          paddingBottom: () => 4,
        },
      },
    ],
  });

  // ===== FOOTER =====
  content.push({
    margin: [0, 14, 0, 0],
    canvas: [
      { type: 'line', x1: 0, y1: 0, x2: 555, y2: 0, lineWidth: 1, lineColor: C.navy },
      { type: 'line', x1: 0, y1: 2, x2: 70, y2: 2, lineWidth: 2, lineColor: C.gold },
    ],
  });

  content.push({
    margin: [0, 6, 0, 0],
    columns: [
      {
        text: 'Thank you for your business.',
        bold: true,
        fontSize: 8,
        color: C.navy,
      },
      {
        text: `Support: ${firm.email && firm.email !== '-' ? firm.email : 'branch office'}${
          firm.phone && firm.phone !== '-' ? `  |  ${firm.phone}` : ''
        }`,
        alignment: 'right',
        fontSize: 7,
        color: C.muted,
      },
    ],
  });

  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [28, 22, 28, 22],
    content,
    defaultStyle: {
      fontSize: 8,
      color: C.text,
    },
    pageBreakBefore: () => false,
  };

  const safeName = String(meta.packetNo || loanDetails.girv_id || 'loan')
    .replace(/[^\w-]+/g, '_')
    .slice(0, 40);
  const fileName = `Loan-Invoice-${safeName}.pdf`;

  pdfMake.createPdf(docDefinition).download(fileName);
  return fileName;
};

export default downloadLoanInvoicePdf;
