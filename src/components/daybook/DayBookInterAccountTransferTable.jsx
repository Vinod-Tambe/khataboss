import React, { useEffect, useRef, useState } from "react";
import $ from "jquery";
import "datatables.net-bs5";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";
import "../../css/DataTable.css";
import {
  calculateInterAccountTransferSectionTotals,
  formatCurrency,
  getInterAccountTransferRowAmount,
} from "./dayBookUtils";

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
            {line.remarks ? (
              <span className="text-muted"> ({line.remarks})</span>
            ) : null}
          </li>
        ))}
      </ul>
    );
  }
  return item.db_to_description || "-";
};

const DayBookInterAccountTransferTable = ({ title, data = [], isPrint = false }) => {
  const tableRef = useRef(null);
  const dataTable = useRef(null);
  const [search, setSearch] = useState("");
  const totals = calculateInterAccountTransferSectionTotals(data);

  useEffect(() => {
    if (isPrint || !tableRef.current) return;

    if (dataTable.current) {
      dataTable.current.destroy();
    }

    dataTable.current = $(tableRef.current).DataTable({
      responsive: false,
      ordering: false,
      paging: true,
      info: false,
      dom: "l t",
      pageLength: 10,
      lengthMenu: [
        [10, 25, 50, 100, -1],
        [10, 25, 50, 100, "All"],
      ],
    });

    return () => {
      if (dataTable.current) {
        dataTable.current.destroy();
      }
    };
  }, [data, isPrint]);

  useEffect(() => {
    if (isPrint || !dataTable.current) return;
    dataTable.current.search(search).draw();
  }, [search, isPrint]);

  return (
    <div className="border border-secondary border-dashed mb-3">
      <div className="d-flex justify-content-between align-items-center">
        <h6 className="fw-bold mb-0 ms-2">{title || "INTER-ACCOUNT TRANSFER"}</h6>
        {!isPrint && (
          <input
            type="search"
            className="form-control form-control-sm border border-dark w-auto mt-2 mb-2 me-2"
            placeholder={title || "INTER-ACCOUNT TRANSFER"}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        )}
      </div>

      <div className="table-responsive">
        <table
          ref={tableRef}
          className="table table-hover table-bordered text-capitalize mb-1 dynamic-data-table"
        >
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
            {data.map((item, index) => {
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
