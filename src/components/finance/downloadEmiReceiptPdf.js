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

const buildReceiptRows = ({ emiData, initialFinance }) => {
  const customerName = initialFinance?.user?.user_first_name
    ? `${initialFinance.user.user_first_name} ${initialFinance.user.user_last_name || ""}`.trim()
    : "N/A";

  return [
    ["Name", customerName],
    ["Reg No", String(initialFinance?.fin_id || "N/A")],
    [
      "Payment Date",
      emiData.ft_payment_date
        ? formatDate(emiData.ft_payment_date)
        : moment().format("DD-MMM-YY"),
    ],
    ["Payment Amt", formatAmt(emiData.ft_paid_amt)],
    ["From Date", formatDate(emiData.ft_start_date)],
    ["To Date", formatDate(emiData.ft_due_date)],
    ["Deposit Amt", formatAmt(initialFinance?.fin_prin_amt)],
    ["Rem. Amt", formatAmt(emiData.ft_pending_amt)],
    [
      "EMI No",
      emiData.ft_emi_no == null || emiData.ft_emi_no === ""
        ? "-"
        : `EMI-${String(emiData.ft_emi_no).replace(/^emi[-\s]?/i, "")}`,
    ],
    ["EMI Amt", formatAmt(emiData.ft_emi_amt)],
    ["Status", String(emiData.ft_emi_status || "-")],
  ];
};

const buildDocDefinition = ({ emiData, initialFinance }) => {
  const firmName =
    initialFinance?.firm?.firm_name || "TAHLKA FINANCE & COMPANY";
  const rows = buildReceiptRows({ emiData, initialFinance });

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
        text: "Finance Payment Receipt",
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

const getFileName = (emiData) =>
  `EMI_Receipt_${emiData?.ft_emi_no || "share"}_${moment().format("DDMMYYYY")}.pdf`;

export const downloadEmiReceiptPdf = (options) => {
  const docDefinition = buildDocDefinition(options);
  const fileName = getFileName(options.emiData);
  pdfMake.createPdf(docDefinition).download(fileName);
  return fileName;
};

export const getEmiReceiptPdfBlob = (options) =>
  new Promise((resolve, reject) => {
    try {
      const docDefinition = buildDocDefinition(options);
      pdfMake.createPdf(docDefinition).getBlob((blob) => resolve(blob));
    } catch (error) {
      reject(error);
    }
  });

export const getEmiReceiptShareText = ({ emiData, initialFinance }) => {
  const firmName =
    initialFinance?.firm?.firm_name || "TAHLKA FINANCE & COMPANY";
  const customerName = initialFinance?.user?.user_first_name
    ? `${initialFinance.user.user_first_name} ${initialFinance.user.user_last_name || ""}`.trim()
    : "N/A";

  return [
    "Finance Payment Receipt",
    `Firm: ${firmName}`,
    `Name: ${customerName}`,
    `Reg No: ${initialFinance?.fin_id || "N/A"}`,
    `EMI No: ${
      emiData?.ft_emi_no == null || emiData?.ft_emi_no === ""
        ? "-"
        : `EMI-${String(emiData.ft_emi_no).replace(/^emi[-\s]?/i, "")}`
    }`,
    `Payment Amt: ${formatAmt(emiData?.ft_paid_amt)}`,
    `EMI Amt: ${formatAmt(emiData?.ft_emi_amt)}`,
    `Pending: ${formatAmt(emiData?.ft_pending_amt)}`,
    `Status: ${emiData?.ft_emi_status || "-"}`,
  ].join("\n");
};

export const getEmiReceiptFileName = (emiData) => getFileName(emiData);
