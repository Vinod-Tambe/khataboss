import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import moment from "moment";

pdfMake.vfs = pdfFonts.vfs || pdfFonts.default?.vfs || pdfFonts;

const formatAmt = (value) =>
  Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatDate = (value) =>
  value ? moment(value).format("DD-MMM-YY") : "-";

const buildReceiptRows = ({ historyData, initialFinance }) => {
  const customerName = initialFinance?.user?.user_first_name
    ? `${initialFinance.user.user_first_name} ${initialFinance.user.user_last_name || ""}`.trim()
    : "N/A";

  const rows = [
    ["Name", customerName],
    ["Reg No / Fin Code", String(initialFinance?.fin_unique_code || initialFinance?.fin_id || "N/A")],
    [
      "Payment Date",
      historyData.fm_trans_date
        ? formatDate(historyData.fm_trans_date)
        : moment().format("DD-MMM-YY"),
    ],
    ["Deposit Amt", formatAmt(initialFinance?.fin_prin_amt)],
    ["Trans Type", String(historyData.fm_trans_type || "-")],
    ["Trans Amt", formatAmt(historyData.fm_trans_amt)],
    ["Cash Amt", formatAmt(historyData.fm_cash_amt)],
    ["Bank Amt", formatAmt(historyData.fm_bank_amt)],
    ["Online Amt", formatAmt(historyData.fm_online_amt)],
    ["Card Amt", formatAmt(historyData.fm_card_amt)],
  ];

  if (historyData.fm_other_info) {
    rows.push(["Other Info", String(historyData.fm_other_info)]);
  }

  return rows;
};

const buildDocDefinition = ({ historyData, initialFinance }) => {
  const firmName =
    initialFinance?.firm?.firm_name || "TAHLKA FINANCE & COMPANY";
  const rows = buildReceiptRows({ historyData, initialFinance });

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
        text: "Payment History Receipt",
        style: "subtitle",
        alignment: "center",
        margin: [0, 0, 0, 12],
      },
      {
        table: {
          widths: ["38%", "*"],
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

const getFileName = (historyData) =>
  `History_Receipt_${moment(historyData?.fm_trans_date || undefined).format("DDMMYYYY")}_${moment().format("HHmm")}.pdf`;

export const downloadHistoryReceiptPdf = (options) => {
  const docDefinition = buildDocDefinition(options);
  const fileName = getFileName(options.historyData);
  pdfMake.createPdf(docDefinition).download(fileName);
  return fileName;
};

export const getHistoryReceiptPdfBlob = (options) =>
  new Promise((resolve, reject) => {
    try {
      const docDefinition = buildDocDefinition(options);
      pdfMake.createPdf(docDefinition).getBlob((blob) => resolve(blob));
    } catch (error) {
      reject(error);
    }
  });

export const getHistoryReceiptShareText = ({ historyData, initialFinance }) => {
  const firmName =
    initialFinance?.firm?.firm_name || "TAHLKA FINANCE & COMPANY";
  const customerName = initialFinance?.user?.user_first_name
    ? `${initialFinance.user.user_first_name} ${initialFinance.user.user_last_name || ""}`.trim()
    : "N/A";

  return [
    "Payment History Receipt",
    `Firm: ${firmName}`,
    `Name: ${customerName}`,
    `Reg No / Fin Code: ${initialFinance?.fin_unique_code || initialFinance?.fin_id || "N/A"}`,
    `Date: ${historyData?.fm_trans_date ? moment(historyData.fm_trans_date).format("DD-MMM-YY") : "-"}`,
    `Type: ${historyData?.fm_trans_type || "-"}`,
    `Trans Amt: ${formatAmt(historyData?.fm_trans_amt)}`,
    `Cash: ${formatAmt(historyData?.fm_cash_amt)}`,
    `Bank: ${formatAmt(historyData?.fm_bank_amt)}`,
  ].join("\n");
};

export const getHistoryReceiptFileName = (historyData) => getFileName(historyData);
