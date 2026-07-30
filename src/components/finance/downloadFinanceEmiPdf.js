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

const formatEmiNo = (value) => {
  if (value == null || value === "") return "-";
  const raw = String(value).trim();
  return `EMI-${raw.replace(/^emi[-\s]?/i, "")}`;
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
    emiAmt: formatAmt(financeData?.fin_emi_amt ?? initialFinance?.fin_emi_amt),
    cashAmt: formatAmt(financeData?.fin_cash_amt),
    bankAmt: formatAmt(financeData?.fin_bank_amt),
    paidAmt: formatAmt(totals?.paidAmt),
    pendingAmt: formatAmt(totals?.pendingAmt),
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
      cell("EMI No", { style: "tableHeader", bold: true }),
      cell("Start Date", { style: "tableHeader", bold: true }),
      cell("EMI Amt", { style: "tableHeader", bold: true }),
      cell("Due Date", { style: "tableHeader", bold: true }),
      cell("Paid Amt", { style: "tableHeader", bold: true }),
      cell("Pending Amt", { style: "tableHeader", bold: true }),
      cell("Status", { style: "tableHeader", bold: true }),
    ],
    ...rows.map((item) => [
      cell(formatEmiNo(item.ft_emi_no), { bold: true }),
      cell(formatDate(item.ft_start_date)),
      cell(formatAmt(item.ft_emi_amt)),
      cell(formatDate(item.ft_due_date)),
      cell(formatAmt(item.ft_paid_amt), { color: "#198754", bold: true }),
      cell(formatAmt(item.ft_pending_amt), { color: "#dc3545", bold: true }),
      cell(item.ft_emi_status || "-"),
    ]),
    [
      cell("Grand Total", { colSpan: 2, bold: true, fillColor: "#f1f3f5" }),
      {},
      cell(formatAmt(totals.emiAmt), { bold: true, fillColor: "#f1f3f5" }),
      cell("", { fillColor: "#f1f3f5" }),
      cell(formatAmt(totals.paidAmt), {
        bold: true,
        color: "#198754",
        fillColor: "#f1f3f5",
      }),
      cell(formatAmt(totals.pendingAmt), {
        bold: true,
        color: "#dc3545",
        fillColor: "#f1f3f5",
      }),
      cell("", { fillColor: "#f1f3f5" }),
    ],
  ];

  return {
    pageSize: "A4",
    pageOrientation: "landscape",
    pageMargins: [30, 30, 30, 30],
    content: [
      {
        text: "Finance Information",
        alignment: "center",
        fontSize: 16,
        bold: true,
        color: "#0d6efd",
        margin: [0, 0, 0, 4],
      },
      {
        text: "EMI Schedule",
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
              cell(`EMI Amt: ${meta.emiAmt}`, { alignment: "left", fontSize: 9 }),
            ],
            [
              cell(`Cash: ${meta.cashAmt}`, { alignment: "left", fontSize: 9 }),
              cell(`Bank: ${meta.bankAmt}`, { alignment: "left", fontSize: 9 }),
              cell(`Paid: ${meta.paidAmt}`, {
                alignment: "left",
                fontSize: 9,
                color: "#198754",
                bold: true,
              }),
              cell(`Pending: ${meta.pendingAmt}`, {
                alignment: "left",
                fontSize: 9,
                color: "#dc3545",
                bold: true,
              }),
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
          widths: ["10%", "15%", "15%", "15%", "15%", "15%", "15%"],
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
    styles: {
      tableHeader: { fontSize: 9, bold: true },
    },
    defaultStyle: { font: "Roboto" },
  };
};

const getFileName = (initialFinance) =>
  `Finance_EMI_${initialFinance?.fin_id || "Schedule"}_${moment().format("DDMMYYYY")}.pdf`;

export const downloadFinanceEmiPdf = (options) => {
  const docDefinition = buildDocDefinition(options);
  const fileName = getFileName(options.initialFinance);
  pdfMake.createPdf(docDefinition).download(fileName);
  return fileName;
};

export const getFinanceEmiPdfBlob = (options) =>
  new Promise((resolve, reject) => {
    try {
      const docDefinition = buildDocDefinition(options);
      pdfMake.createPdf(docDefinition).getBlob((blob) => resolve(blob));
    } catch (error) {
      reject(error);
    }
  });

export const getFinanceEmiShareText = (options) => {
  const meta = getMeta(options);
  return [
    "Finance Information — EMI Schedule",
    `Firm: ${meta.firmName}`,
    `Name: ${meta.customerName}`,
    `Fin No: ${meta.finId}`,
    `Principal: ${meta.prinAmt}`,
    `EMI Amt: ${meta.emiAmt}`,
    `Paid: ${meta.paidAmt}`,
    `Pending: ${meta.pendingAmt}`,
    `Total EMIs: ${options.rows?.length || 0}`,
  ].join("\n");
};

export const getFinanceEmiFileName = (initialFinance) =>
  getFileName(initialFinance);

export const buildFinanceEmiPrintHtml = ({
  rows = [],
  totals = {},
  initialFinance,
  financeData,
}) => {
  const meta = getMeta({ initialFinance, financeData, totals });
  const bodyRows = rows
    .map(
      (item) => `
      <tr>
        <td>${formatEmiNo(item.ft_emi_no)}</td>
        <td>${formatDate(item.ft_start_date)}</td>
        <td>${formatAmt(item.ft_emi_amt)}</td>
        <td>${formatDate(item.ft_due_date)}</td>
        <td class="paid">${formatAmt(item.ft_paid_amt)}</td>
        <td class="pending">${formatAmt(item.ft_pending_amt)}</td>
        <td>${item.ft_emi_status || "-"}</td>
      </tr>`
    )
    .join("");

  return `
    <div class="finance-emi-print">
      <h2>Finance Information</h2>
      <p class="subtitle">EMI Schedule</p>
      <h3>${meta.firmName}</h3>
      <table class="meta-table">
        <tr>
          <td><strong>Name:</strong> ${meta.customerName}</td>
          <td><strong>Fin No:</strong> ${meta.finId}</td>
          <td><strong>Principal:</strong> ${meta.prinAmt}</td>
          <td><strong>EMI Amt:</strong> ${meta.emiAmt}</td>
        </tr>
        <tr>
          <td><strong>Cash:</strong> ${meta.cashAmt}</td>
          <td><strong>Bank:</strong> ${meta.bankAmt}</td>
          <td class="paid"><strong>Paid:</strong> ${meta.paidAmt}</td>
          <td class="pending"><strong>Pending:</strong> ${meta.pendingAmt}</td>
        </tr>
      </table>
      <table class="emi-table">
        <thead>
          <tr>
            <th>EMI No</th>
            <th>Start Date</th>
            <th>EMI Amt</th>
            <th>Due Date</th>
            <th>Paid Amt</th>
            <th>Pending Amt</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>${bodyRows || `<tr><td colspan="7">No EMI records</td></tr>`}</tbody>
        <tfoot>
          <tr>
            <th colspan="2">Grand Total</th>
            <th>${formatAmt(totals.emiAmt)}</th>
            <th></th>
            <th class="paid">${formatAmt(totals.paidAmt)}</th>
            <th class="pending">${formatAmt(totals.pendingAmt)}</th>
            <th></th>
          </tr>
        </tfoot>
      </table>
    </div>
  `;
};

export const printFinanceEmiSchedule = (options) => {
  const content = buildFinanceEmiPrintHtml(options);
  const iframe = document.createElement("iframe");
  iframe.setAttribute(
    "style",
    "position:fixed;right:0;bottom:0;width:0;height:0;border:0;"
  );
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow.document;
  doc.open();
  doc.write(`<!DOCTYPE html><html><head><title>Finance EMI Schedule</title>
    <style>
      @page { size: A4 landscape; margin: 12mm; }
      * { box-sizing: border-box; }
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        font-family: Arial, Helvetica, sans-serif;
        color: #212529;
        background: #fff;
      }
      body {
        display: flex;
        justify-content: center;
        align-items: flex-start;
        padding: 16px;
      }
      .finance-emi-print {
        width: 100%;
        max-width: 1100px;
        margin: 0 auto;
        text-align: center;
      }
      h2 {
        margin: 0 0 2px;
        font-size: 20px;
        color: #0d6efd;
        text-align: center;
      }
      .subtitle {
        margin: 0 0 4px;
        font-size: 13px;
        font-weight: 700;
        text-align: center;
      }
      h3 {
        margin: 0 0 14px;
        font-size: 14px;
        text-align: center;
        text-transform: uppercase;
      }
      .meta-table {
        width: 100%;
        border-collapse: collapse;
        margin: 0 auto 14px;
        font-size: 12px;
        text-align: left;
      }
      .meta-table td {
        border: 1px solid #ced4da;
        padding: 6px 8px;
        width: 25%;
      }
      .emi-table {
        width: 100%;
        border-collapse: collapse;
        margin: 0 auto;
        font-size: 12px;
      }
      .emi-table th,
      .emi-table td {
        border: 1px solid #868e96;
        padding: 7px 6px;
        text-align: center;
        vertical-align: middle;
      }
      .emi-table thead th { background: #e9ecef; font-weight: 700; }
      .emi-table tfoot th { background: #f1f3f5; font-weight: 700; }
      .paid { color: #198754; font-weight: 700; }
      .pending { color: #dc3545; font-weight: 700; }
      @media print {
        body { padding: 0; display: block; }
        .finance-emi-print { max-width: none; }
      }
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
