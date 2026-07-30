import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import moment from "moment";

pdfMake.vfs = pdfFonts.vfs || pdfFonts.default?.vfs || pdfFonts;

const formatAmt = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatDate = (value) => {
  if (!value) return "-";
  const m = moment(value);
  return m.isValid() ? m.format("DD-MM-YYYY") : String(value);
};

const getMeta = ({ initialFinance, financeData, totals }) => {
  const customerName = initialFinance?.user?.user_first_name
    ? `${initialFinance.user.user_first_name} ${initialFinance.user.user_last_name || ""}`.trim()
    : "N/A";
  const firmName =
    initialFinance?.firm?.firm_name || "TAHLKA FINANCE & COMPANY";

  return {
    customerName,
    firmName,
    finId: String(initialFinance?.fin_id ?? "N/A"),
    prinAmt: formatAmt(financeData?.fin_prin_amt ?? initialFinance?.fin_prin_amt),
    transAmt: formatAmt(totals?.transAmt),
    cashAmt: formatAmt(totals?.cashAmt),
    bankAmt: formatAmt(totals?.bankAmt),
    onlineAmt: formatAmt(totals?.onlineAmt),
    cardAmt: formatAmt(totals?.cardAmt),
  };
};

const cell = (text, opts = {}) => ({
  text: text == null || text === "" ? "-" : String(text),
  alignment: "center",
  fontSize: 9,
  margin: [2, 3, 2, 3],
  ...opts,
});

const buildDocDefinition = ({
  rows = [],
  totals = {},
  initialFinance,
  financeData,
}) => {
  const meta = getMeta({ initialFinance, financeData, totals });

  const tableBody = [
    [
      cell("Date", { bold: true }),
      cell("Trans Amt", { bold: true }),
      cell("Cash", { bold: true }),
      cell("Bank", { bold: true }),
      cell("Online", { bold: true }),
      cell("Card", { bold: true }),
      cell("Type", { bold: true }),
      cell("Other", { bold: true }),
    ],
    ...rows.map((item) => [
      cell(formatDate(item.fm_trans_date)),
      cell(formatAmt(item.fm_trans_amt), { bold: true }),
      cell(formatAmt(item.fm_cash_amt), { color: "#198754" }),
      cell(formatAmt(item.fm_bank_amt), { color: "#0dcaf0" }),
      cell(formatAmt(item.fm_online_amt)),
      cell(formatAmt(item.fm_card_amt), { color: "#ffc107" }),
      cell(item.fm_trans_type || "-"),
      cell(item.fm_other_info || "-", { fontSize: 8 }),
    ]),
    [
      cell("Grand Total", { bold: true, fillColor: "#f1f3f5" }),
      cell(formatAmt(totals.transAmt), { bold: true, fillColor: "#f1f3f5" }),
      cell(formatAmt(totals.cashAmt), {
        bold: true,
        color: "#198754",
        fillColor: "#f1f3f5",
      }),
      cell(formatAmt(totals.bankAmt), { bold: true, fillColor: "#f1f3f5" }),
      cell(formatAmt(totals.onlineAmt), { bold: true, fillColor: "#f1f3f5" }),
      cell(formatAmt(totals.cardAmt), { bold: true, fillColor: "#f1f3f5" }),
      cell("", { fillColor: "#f1f3f5" }),
      cell("", { fillColor: "#f1f3f5" }),
    ],
  ];

  return {
    pageSize: "A4",
    pageOrientation: "landscape",
    pageMargins: [30, 30, 30, 30],
    content: [
      {
        text: "Finance History",
        alignment: "center",
        fontSize: 16,
        bold: true,
        color: "#0d6efd",
        margin: [0, 0, 0, 4],
      },
      {
        text: "Payment Transactions",
        alignment: "center",
        fontSize: 12,
        bold: true,
        margin: [0, 0, 0, 4],
      },
      {
        text: meta.firmName,
        alignment: "center",
        fontSize: 11,
        bold: true,
        margin: [0, 0, 0, 12],
      },
      {
        table: {
          widths: ["*", "*", "*", "*"],
          body: [
            [
              cell(`Name: ${meta.customerName}`, { alignment: "left", fontSize: 9 }),
              cell(`Fin No: ${meta.finId}`, { alignment: "left", fontSize: 9 }),
              cell(`Principal: ${meta.prinAmt}`, { alignment: "left", fontSize: 9 }),
              cell(`Total Trans: ${meta.transAmt}`, {
                alignment: "left",
                fontSize: 9,
                bold: true,
              }),
            ],
            [
              cell(`Cash: ${meta.cashAmt}`, {
                alignment: "left",
                fontSize: 9,
                color: "#198754",
              }),
              cell(`Bank: ${meta.bankAmt}`, { alignment: "left", fontSize: 9 }),
              cell(`Online: ${meta.onlineAmt}`, { alignment: "left", fontSize: 9 }),
              cell(`Card: ${meta.cardAmt}`, { alignment: "left", fontSize: 9 }),
            ],
          ],
        },
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => "#ced4da",
          vLineColor: () => "#ced4da",
          paddingLeft: () => 6,
          paddingRight: () => 6,
          paddingTop: () => 4,
          paddingBottom: () => 4,
        },
        margin: [0, 0, 0, 14],
      },
      {
        table: {
          headerRows: 1,
          widths: ["12%", "12%", "11%", "11%", "11%", "11%", "12%", "20%"],
          body: tableBody,
        },
        layout: {
          hLineWidth: () => 0.7,
          vLineWidth: () => 0.7,
          hLineColor: () => "#868e96",
          vLineColor: () => "#868e96",
          fillColor: (rowIndex) => (rowIndex === 0 ? "#e9ecef" : null),
          paddingLeft: () => 4,
          paddingRight: () => 4,
          paddingTop: () => 5,
          paddingBottom: () => 5,
        },
      },
    ],
    defaultStyle: { font: "Roboto" },
  };
};

const getFileName = (initialFinance) =>
  `Finance_History_${initialFinance?.fin_id || "Schedule"}_${moment().format("DDMMYYYY")}.pdf`;

export const downloadFinanceHistoryPdf = (options) => {
  const docDefinition = buildDocDefinition(options);
  const fileName = getFileName(options.initialFinance);
  pdfMake.createPdf(docDefinition).download(fileName);
  return fileName;
};

export const getFinanceHistoryPdfBlob = (options) =>
  new Promise((resolve, reject) => {
    try {
      const docDefinition = buildDocDefinition(options);
      pdfMake.createPdf(docDefinition).getBlob((blob) => resolve(blob));
    } catch (error) {
      reject(error);
    }
  });

export const getFinanceHistoryShareText = (options) => {
  const meta = getMeta(options);
  return [
    "Finance History — Payment Transactions",
    `Firm: ${meta.firmName}`,
    `Name: ${meta.customerName}`,
    `Fin No: ${meta.finId}`,
    `Total Trans: ${meta.transAmt}`,
    `Cash: ${meta.cashAmt}`,
    `Bank: ${meta.bankAmt}`,
    `Online: ${meta.onlineAmt}`,
    `Card: ${meta.cardAmt}`,
    `Entries: ${options.rows?.length || 0}`,
  ].join("\n");
};

export const getFinanceHistoryFileName = (initialFinance) =>
  getFileName(initialFinance);

export const printFinanceHistorySchedule = (options) => {
  const meta = getMeta(options);
  const { rows = [], totals = {} } = options;

  const bodyRows = rows
    .map(
      (item) => `
      <tr>
        <td>${formatDate(item.fm_trans_date)}</td>
        <td>${formatAmt(item.fm_trans_amt)}</td>
        <td class="paid">${formatAmt(item.fm_cash_amt)}</td>
        <td>${formatAmt(item.fm_bank_amt)}</td>
        <td>${formatAmt(item.fm_online_amt)}</td>
        <td>${formatAmt(item.fm_card_amt)}</td>
        <td>${item.fm_trans_type || "-"}</td>
        <td>${item.fm_other_info || "-"}</td>
      </tr>`
    )
    .join("");

  const content = `
    <div class="finance-emi-print">
      <h2>Finance History</h2>
      <p class="subtitle">Payment Transactions</p>
      <h3>${meta.firmName}</h3>
      <table class="meta-table">
        <tr>
          <td><strong>Name:</strong> ${meta.customerName}</td>
          <td><strong>Fin No:</strong> ${meta.finId}</td>
          <td><strong>Principal:</strong> ${meta.prinAmt}</td>
          <td><strong>Total Trans:</strong> ${meta.transAmt}</td>
        </tr>
        <tr>
          <td class="paid"><strong>Cash:</strong> ${meta.cashAmt}</td>
          <td><strong>Bank:</strong> ${meta.bankAmt}</td>
          <td><strong>Online:</strong> ${meta.onlineAmt}</td>
          <td><strong>Card:</strong> ${meta.cardAmt}</td>
        </tr>
      </table>
      <table class="emi-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Trans Amt</th>
            <th>Cash</th>
            <th>Bank</th>
            <th>Online</th>
            <th>Card</th>
            <th>Type</th>
            <th>Other</th>
          </tr>
        </thead>
        <tbody>${bodyRows || `<tr><td colspan="8">No records</td></tr>`}</tbody>
        <tfoot>
          <tr>
            <th>Grand Total</th>
            <th>${formatAmt(totals.transAmt)}</th>
            <th class="paid">${formatAmt(totals.cashAmt)}</th>
            <th>${formatAmt(totals.bankAmt)}</th>
            <th>${formatAmt(totals.onlineAmt)}</th>
            <th>${formatAmt(totals.cardAmt)}</th>
            <th></th>
            <th></th>
          </tr>
        </tfoot>
      </table>
    </div>
  `;

  const iframe = document.createElement("iframe");
  iframe.setAttribute(
    "style",
    "position:fixed;right:0;bottom:0;width:0;height:0;border:0;"
  );
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow.document;
  doc.open();
  doc.write(`<!DOCTYPE html><html><head><title>Finance History</title>
    <style>
      @page { size: A4 landscape; margin: 12mm; }
      * { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; color: #212529; background: #fff; }
      body { display: flex; justify-content: center; padding: 16px; }
      .finance-emi-print { width: 100%; max-width: 1100px; margin: 0 auto; text-align: center; }
      h2 { margin: 0 0 2px; font-size: 20px; color: #0d6efd; }
      .subtitle { margin: 0 0 4px; font-size: 13px; font-weight: 700; }
      h3 { margin: 0 0 14px; font-size: 14px; text-transform: uppercase; }
      .meta-table { width: 100%; border-collapse: collapse; margin: 0 auto 14px; font-size: 12px; text-align: left; }
      .meta-table td { border: 1px solid #ced4da; padding: 6px 8px; width: 25%; }
      .emi-table { width: 100%; border-collapse: collapse; margin: 0 auto; font-size: 12px; }
      .emi-table th, .emi-table td { border: 1px solid #868e96; padding: 7px 6px; text-align: center; vertical-align: middle; }
      .emi-table thead th { background: #e9ecef; font-weight: 700; }
      .emi-table tfoot th { background: #f1f3f5; font-weight: 700; }
      .paid { color: #198754; font-weight: 700; }
      @media print { body { padding: 0; display: block; } .finance-emi-print { max-width: none; } }
    </style>
  </head><body>${content}</body></html>`);
  doc.close();

  setTimeout(() => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => {
      if (iframe.parentNode) document.body.removeChild(iframe);
    }, 1000);
  }, 500);
};
