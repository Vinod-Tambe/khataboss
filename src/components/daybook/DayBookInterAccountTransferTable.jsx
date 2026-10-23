import React, { useState } from "react";
import "../../css/DataTable.css";
import {
  calculateInterAccountTransferSectionTotals,
  formatCurrency,
  getInterAccountTransferRowAmount,
} from "./dayBookUtils";
import { PERSONAL_EXPENSES_DAYBOOK_TITLE } from "../../constants/personalExpense";
import DaybookSectionTableToolbar from "./DaybookSectionTableToolbar";
import {
  DAYBOOK_PAGE_LENGTH_ALL,
  DAYBOOK_PAGE_LENGTH_DEFAULT,
  useDaybookDisplayRows,
} from "./daybookTableDisplay";

const renderToDetail = (item) => {
  const lines = item.db_to_lines;
  if (Array.isArray(lines) && lines.length > 1) {
    return (
      <ul className="mb-0 ps-3 small text-start">
        {lines.map((line, idx) => (
          <li key={`${line.account}-${idx}`}>
            <span className="fw-semibold">{line.account}</span>
            {" — "}
            {formatCurrency(line.amount)}
          </li>
        ))}
      </ul>
    );
  }
  return item.db_to_description || "-";
};

const DayBookInterAccountTransferTable = ({ title, data = [], isPrint = false }) => {
  const [search, setSearch] = useState("");
  const [pageLength, setPageLength] = useState(DAYBOOK_PAGE_LENGTH_DEFAULT);
  const displayRows = useDaybookDisplayRows(
    data,
    isPrint ? "" : search,
    isPrint ? DAYBOOK_PAGE_LENGTH_ALL : pageLength
  );
  const totals = calculateInterAccountTransferSectionTotals(data);

  return (
    <div className="daybook-section-table border border-secondary border-dashed mb-3">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
        <h6 className="fw-bold mb-0 ms-2">{title || PERSONAL_EXPENSES_DAYBOOK_TITLE}</h6>
        {!isPrint && (
          <DaybookSectionTableToolbar
            search={search}
            onSearchChange={setSearch}
            pageLength={pageLength}
            onPageLengthChange={setPageLength}
            searchPlaceholder={title || PERSONAL_EXPENSES_DAYBOOK_TITLE}
          />
        )}
      </div>

      <div className="table-responsive">
        <table className="table table-hover table-bordered text-capitalize mb-0 dynamic-data-table">
          <thead className="table-light">
            <tr>
              <th className="bg-pink border border-dark">DATE</th>
              <th className="bg-pink border border-dark">FIRM</th>
              <th className="bg-pink border border-dark">ENTRY</th>
              <th className="bg-pink border border-dark">FROM ACCOUNT</th>
              <th className="bg-pink border border-dark">TO / SPLIT DETAIL</th>
              <th className="bg-pink border border-dark text-end" style={{ width: "90px" }}>
                AMOUNT
              </th>
              <th className="bg-pink border border-dark" style={{ minWidth: "280px", width: "28%" }}>
                NARRATION
              </th>
            </tr>
          </thead>
          <tbody>
            {displayRows.map((item, index) => {
              const amount = getInterAccountTransferRowAmount(item);
              return (
                <tr key={item.db_mtf_uuid || index}>
                  <td className="border border-dark">{item.db_date}</td>
                  <td className="border border-dark">{item.db_firm}</td>
                  <td className="border border-dark fw-semibold">{item.db_direction || "-"}</td>
                  <td className="border border-dark fw-bold text-brown">
                    {item.db_from_account || "-"}
                  </td>
                  <td className="border border-dark align-top">{renderToDetail(item)}</td>
                  <td className="text-end border border-dark text-primary fw-bold">
                    {amount.toFixed(2)}
                  </td>
                  <td
                    className="border border-dark align-top"
                    style={{ minWidth: "280px", wordBreak: "break-word", textTransform: "none" }}
                  >
                    {item.db_narration || "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <th className="text-end bg-cust-info border border-dark" colSpan={5}>
                TOTAL AMT :
              </th>
              <th className="text-end fw-bold bg-cust-info border border-dark text-primary">
                {totals.total.toFixed(2)}
              </th>
              <th className="bg-cust-info border border-dark"></th>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default DayBookInterAccountTransferTable;

