import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { formatCurrency, sumAmounts } from "./profitLossData";

pdfMake.vfs = pdfFonts.vfs || pdfFonts.default?.vfs || pdfFonts;

const COLORS = {
  title: "#8B4513",
  meta: "#333333",
  headerBg: "#e9eff9",
  headerText: "#8B4513",
  footerBg: "#e4f0fa",
  footerText: "#212529",
  cellText: "#212529",
  profit: "#0f7a3a",
  profitBg: "#eaf8ef",
  loss: "#c62828",
  lossBg: "#fdecee",
  border: "#adb5bd",
  sectionTitle: "#5b4f90",
};

const cellTone = (item = "") => {
  if (/loss/i.test(item)) return "loss";
  if (/profit/i.test(item)) return "profit";
  return null;
};

const nameCell = (row) => {
  if (!row) return { text: "", style: "tableCell" };
  const tone = cellTone(row.item);
  return {
    text: (row.item || "").toUpperCase(),
    style: tone === "loss" ? "lossCell" : tone === "profit" ? "profitCell" : "tableCell",
  };
};

const amountCell = (row) => {
  if (!row) return { text: "", style: "tableCell", alignment: "right" };
  const tone = cellTone(row.item);
  return {
    text: formatCurrency(row.amount),
    style: tone === "loss" ? "lossCell" : tone === "profit" ? "profitCell" : "tableCell",
    alignment: "right",
  };
};

const buildAccountTable = (account) => {
  const { expenditure = [], revenue = [], title } = account;
  const maxRows = Math.max(expenditure.length, revenue.length, 1);
  const totalExpenditure = sumAmounts(expenditure);
  const totalRevenue = sumAmounts(revenue);

  const body = [
    [
      { text: "Expenditure", style: "tableHeader" },
      { text: "Amount", style: "tableHeader", alignment: "right" },
      { text: "Revenue", style: "tableHeader" },
      { text: "Amount", style: "tableHeader", alignment: "right" },
    ],
  ];

  for (let i = 0; i < maxRows; i += 1) {
    body.push([
      nameCell(expenditure[i]),
      amountCell(expenditure[i]),
      nameCell(revenue[i]),
      amountCell(revenue[i]),
    ]);
  }

  const totalRowIndex = body.length;
  body.push([
    { text: "Total", style: "tableFooter" },
    {
      text: formatCurrency(totalExpenditure),
      style: "tableFooter",
      alignment: "right",
    },
    { text: "Total", style: "tableFooter" },
    {
      text: formatCurrency(totalRevenue),
      style: "tableFooter",
      alignment: "right",
    },
  ]);

  return {
    stack: [
      {
        text: title,
        style: "sectionTitle",
        alignment: "center",
        margin: [0, 0, 0, 6],
      },
      {
        table: {
          headerRows: 1,
          widths: ["*", 70, "*", 70],
          body,
        },
        layout: {
          fillColor: (rowIndex) => {
            if (rowIndex === 0) return COLORS.headerBg;
            if (rowIndex === totalRowIndex) return COLORS.footerBg;

            const exp = expenditure[rowIndex - 1];
            const rev = revenue[rowIndex - 1];
            const expTone = cellTone(exp?.item);
            const revTone = cellTone(rev?.item);
            if (expTone === "loss" || revTone === "loss") return COLORS.lossBg;
            if (expTone === "profit" || revTone === "profit") return COLORS.profitBg;
            return null;
          },
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => COLORS.border,
          vLineColor: () => COLORS.border,
          paddingLeft: () => 5,
          paddingRight: () => 5,
          paddingTop: () => 4,
          paddingBottom: () => 4,
        },
      },
    ],
    margin: [0, 0, 0, 14],
  };
};

const buildDocDefinition = ({
  accounts = [],
  firmName,
  companyName,
  periodStart,
  periodEnd,
  assessmentYear,
}) => ({
  pageOrientation: "portrait",
  pageMargins: [24, 28, 24, 28],
  content: [
    {
      text: "Profit & Loss",
      style: "title",
      alignment: "center",
      margin: [0, 0, 0, 4],
    },
    {
      text: companyName || "",
      style: "meta",
      alignment: "center",
      margin: [0, 0, 0, 8],
    },
    {
      columns: [
        { text: `Firm: ${firmName || "Selected Firm"}`, style: "meta" },
        {
          text: `FY: ${periodStart} To ${periodEnd}`,
          style: "meta",
          alignment: "right",
        },
      ],
      margin: [0, 0, 0, 2],
    },
    {
      text: `Assessment Year: ${assessmentYear || "-"}`,
      style: "meta",
      margin: [0, 0, 0, 12],
    },
    ...accounts.map((account) => buildAccountTable(account)),
  ],
  styles: {
    title: { fontSize: 16, bold: true, color: COLORS.title },
    sectionTitle: { fontSize: 11, bold: true, color: COLORS.sectionTitle },
    meta: { fontSize: 9, color: COLORS.meta },
    tableHeader: { fontSize: 9, bold: true, color: COLORS.headerText },
    tableCell: { fontSize: 8, color: COLORS.cellText },
    tableFooter: { fontSize: 8, bold: true, color: COLORS.footerText },
    profitCell: { fontSize: 8, bold: true, color: COLORS.profit },
    lossCell: { fontSize: 8, bold: true, color: COLORS.loss },
  },
  defaultStyle: { font: "Roboto" },
});

const getFileName = (periodStart, periodEnd) =>
  `Profit_Loss_${periodStart}_to_${periodEnd}.pdf`.replace(/\//g, "-");

export const downloadProfitLossPdf = (options) => {
  const docDefinition = buildDocDefinition(options);
  const fileName = getFileName(options.periodStart, options.periodEnd);
  pdfMake.createPdf(docDefinition).download(fileName);
  return fileName;
};

export const getProfitLossPdfBlob = (options) =>
  new Promise((resolve, reject) => {
    try {
      const docDefinition = buildDocDefinition(options);
      pdfMake.createPdf(docDefinition).getBlob((blob) => resolve(blob));
    } catch (error) {
      reject(error);
    }
  });

export const getProfitLossShareText = ({
  firmName,
  periodStart,
  periodEnd,
  assessmentYear,
  accounts = [],
}) => {
  const lines = [
    "Profit & Loss Report",
    `Firm: ${firmName || "Selected Firm"}`,
    `FY: ${periodStart} To ${periodEnd}`,
    `AY: ${assessmentYear || "-"}`,
  ];

  accounts.forEach((account) => {
    const exp = sumAmounts(account.expenditure);
    const rev = sumAmounts(account.revenue);
    lines.push(
      `${account.title}: Exp ${formatCurrency(exp)} | Rev ${formatCurrency(rev)}`
    );
  });

  return lines.join("\n");
};
