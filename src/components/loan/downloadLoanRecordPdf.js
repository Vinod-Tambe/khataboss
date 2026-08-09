import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import moment from "moment";

pdfMake.vfs = pdfFonts.vfs || pdfFonts.default?.vfs || pdfFonts;

const formatAmt = (value) =>
  Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const getCustomerName = (customer, loanDetails) => {
  if (customer?.user_first_name) {
    return `${customer.user_first_name} ${customer.user_last_name || ""}`.trim();
  }
  if (loanDetails?.user?.user_first_name) {
    return `${loanDetails.user.user_first_name} ${loanDetails.user.user_last_name || ""}`.trim();
  }
  return "N/A";
};

const getTitle = (type) => {
  if (type === "deposit") return "Loan Deposit Receipt";
  if (type === "release") return "Loan Release Receipt";
  return "Loan Principal Receipt";
};

/** Only include Cash/Bank/Online/Card when that mode has amount > 0 */
const buildPaymentModeRows = (record) => {
  const rows = [["Trans Amt", formatAmt(record?.transAmt ?? record?.total)]];

  const modes = [
    ["Cash Amt", record?.cashAmt],
    ["Bank Amt", record?.bankAmt],
    ["Online Amt", record?.onlineAmt],
    ["Card Amt", record?.cardAmt],
  ];

  modes.forEach(([label, amount]) => {
    if (Number(amount) > 0) {
      rows.push([label, formatAmt(amount)]);
    }
  });

  return rows;
};

export const buildLoanRecordReceiptRows = ({ type, record, loanDetails, customer }) => {
  const customerName = getCustomerName(customer, loanDetails);
  const firmName = loanDetails?.firm?.firm_name || "TAHLKA FINANCE & COMPANY";
  const packetNo = loanDetails?.girv_packet_no || "-";
  const loanId = loanDetails?.girv_unique_code || loanDetails?.girv_loan_no || loanDetails?.girv_id || "N/A";

  const common = [
    ["Firm", firmName],
    ["Name", customerName],
    ["Loan No", String(loanId)],
    ["Packet No", String(packetNo)],
  ];

  const paymentRows = buildPaymentModeRows(record);

  if (type === "deposit") {
    return [
      ...common,
      ["Deposit Date", record?.date || "-"],
      ["Status", String(record?.status || "-")],
      ["Principal Received", formatAmt(record?.principal)],
      ["Interest Received", formatAmt(record?.sInterest)],
      ["Discount Amt", formatAmt(record?.discount)],
      ["Extra Amt", formatAmt(record?.extraAmt)],
      ["Total Received", formatAmt(record?.total)],
      ...paymentRows,
    ];
  }

  if (type === "release") {
    return [
      ...common,
      ["Release Date", record?.date || "-"],
      ["Status", String(record?.status || "-")],
      ["Principal Received", formatAmt(record?.principal)],
      ["Interest Received", formatAmt(record?.sInterest)],
      ["Discount Amt", formatAmt(record?.discount)],
      ["Extra Amt", formatAmt(record?.extraAmt)],
      ["Total Received", formatAmt(record?.total)],
      ...paymentRows,
    ];
  }

  // principal
  return [
    ...common,
    ["Status", String(record?.status || "-")],
    ["Principal Amt", formatAmt(record?.principal)],
    ["ROI", `${record?.roi ?? 0}%`],
    ["Interest", formatAmt(record?.sInterest)],
    ["Discount Amt", formatAmt(record?.discount)],
    ["Extra Amt", formatAmt(record?.extraAmt)],
    ["Total", formatAmt(record?.total)],
    ["Start Date", record?.startDate || "-"],
    ["End Date", record?.endDate || "-"],
    ["Time Period", record?.timePeriod || "-"],
    ...paymentRows,
    ...(record?.valuation !== undefined && record?.valuation !== "-"
      ? [["Valuation", formatAmt(record.valuation)]]
      : []),
    ...(record?.profitLoss !== undefined && record?.profitLoss !== "-"
      ? [
          [
            "Profit / Loss",
            Number(record.profitLoss) >= 0
              ? `+${formatAmt(record.profitLoss)}`
              : formatAmt(record.profitLoss),
          ],
        ]
      : []),
  ];
};

const buildDocDefinition = (options) => {
  const { type, loanDetails } = options;
  const firmName = loanDetails?.firm?.firm_name || "TAHLKA FINANCE & COMPANY";
  const rows = buildLoanRecordReceiptRows(options);

  return {
    pageSize: "A5",
    pageMargins: [28, 28, 28, 28],
    content: [
      {
        text: firmName,
        style: "firmTitle",
        alignment: "center",
        margin: [0, 0, 0, 8],
      },
      {
        canvas: [
          {
            type: "line",
            x1: 0,
            y1: 0,
            x2: 340,
            y2: 0,
            lineWidth: 1.5,
            lineColor: "#000",
          },
        ],
        margin: [0, 0, 0, 14],
      },
      {
        text: getTitle(type),
        style: "subtitle",
        alignment: "center",
        margin: [0, 0, 0, 12],
      },
      {
        table: {
          widths: ["40%", "*"],
          body: rows.map(([label, value]) => [
            { text: `${label} :`, style: "labelCell" },
            { text: value, style: "valueCell" },
          ]),
        },
        layout: {
          hLineWidth: () => 0.8,
          vLineWidth: () => 0.8,
          hLineColor: () => "#212529",
          vLineColor: () => "#212529",
          paddingLeft: () => 8,
          paddingRight: () => 8,
          paddingTop: () => 6,
          paddingBottom: () => 6,
        },
      },
    ],
    styles: {
      firmTitle: { fontSize: 13, bold: true },
      subtitle: { fontSize: 11, bold: true, color: "#333" },
      labelCell: { fontSize: 10, bold: true },
      valueCell: { fontSize: 10 },
    },
    defaultStyle: { font: "Roboto" },
  };
};

const getFileName = ({ type, record }) => {
  const label =
    type === "deposit" ? "Deposit" : type === "release" ? "Release" : "Principal";
  const datePart = (record?.date || record?.startDate || moment().format("DDMMYYYY"))
    .toString()
    .replace(/[^\w-]/g, "_");
  return `Loan_${label}_${datePart}_${moment().format("HHmm")}.pdf`;
};

export const downloadLoanRecordPdf = (options) => {
  const docDefinition = buildDocDefinition(options);
  const fileName = getFileName(options);
  pdfMake.createPdf(docDefinition).download(fileName);
  return fileName;
};

export const getLoanRecordPdfBlob = (options) =>
  new Promise((resolve, reject) => {
    try {
      const docDefinition = buildDocDefinition(options);
      pdfMake.createPdf(docDefinition).getBlob((blob) => resolve(blob));
    } catch (error) {
      reject(error);
    }
  });

export const getLoanRecordShareText = (options) => {
  const rows = buildLoanRecordReceiptRows(options);
  return [getTitle(options.type), ...rows.map(([k, v]) => `${k}: ${v}`)].join("\n");
};

export const getLoanRecordFileName = (options) => getFileName(options);

export const getLoanRecordTitle = (type) => getTitle(type);
