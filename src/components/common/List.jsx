import React, { useEffect, useRef, useState } from "react";
import $ from "jquery";
import moment from "moment";
import "../../css/DataTable.css";

// DataTables & extensions
import "datatables.net-bs5";
import "datatables.net-responsive-bs5";
import "datatables.net-buttons-bs5";
import "datatables.net-buttons/js/buttons.html5.min.js";
import "datatables.net-buttons/js/buttons.print.min.js";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";

// DateRangePicker
import "daterangepicker";
import "daterangepicker/daterangepicker.css";

// Required for HTML5 export buttons
import JSZip from "jszip";
import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";

// Register globally
window.JSZip = JSZip;
pdfMake.vfs = pdfFonts.vfs || pdfFonts.default?.vfs || pdfFonts;

const List = ({
  data,
  columns,
  title,
  onEdit,
  onDelete,
  onPrint,
  hasEdit = false,
  hasDelete = false,
  hasPrint = false,
}) => {
  const tableRef = useRef(null);
  const dateRef = useRef(null);
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
  const [tableInstance, setTableInstance] = useState(null);

  // ─── Date Range Picker ────────────────────────────────────────
  useEffect(() => {
    if (!dateRef.current) return;

    const currentYear = moment().year();
    const isAfterMarch = moment().month() >= 3;
    const fyStart = isAfterMarch ? moment(`${currentYear}-04-01`) : moment(`${currentYear - 1}-04-01`);
    const fyEnd = isAfterMarch ? moment(`${currentYear + 1}-03-31`) : moment(`${currentYear}-03-31`);

    $(dateRef.current).daterangepicker(
      {
        startDate: fyStart,
        endDate: fyEnd,
        autoUpdateInput: false,
        locale: { format: "DD-MM-YYYY", cancelLabel: "Clear" },
        ranges: {
          Today: [moment(), moment()],
          "This Month": [moment().startOf("month"), moment().endOf("month")],
          "Last Month": [
            moment().subtract(1, "month").startOf("month"),
            moment().subtract(1, "month").endOf("month"),
          ],
          "Current Financial Year": [fyStart, fyEnd],
          "Last Financial Year": [
            moment(fyStart).subtract(1, "year"),
            moment(fyEnd).subtract(1, "year"),
          ],
        },
      },
      (start, end) => {
        $(dateRef.current).val(`${start.format("DD-MM-YYYY")} - ${end.format("DD-MM-YYYY")}`);
        setDateRange({
          startDate: start.format("YYYY-MM-DD"),
          endDate: end.format("YYYY-MM-DD"),
        });
      }
    );

    $(dateRef.current).val(`${fyStart.format("DD-MM-YYYY")} - ${fyEnd.format("DD-MM-YYYY")}`);
    setDateRange({
      startDate: fyStart.format("YYYY-MM-DD"),
      endDate: fyEnd.format("YYYY-MM-DD"),
    });

    return () => {
      $(dateRef.current).data("daterangepicker")?.remove();
    };
  }, []);

  // ─── DataTable Initialization ─────────────────────────────────
  useEffect(() => {
    if (!tableRef.current || !data || !columns) return;

    if ($.fn.DataTable.isDataTable(tableRef.current)) {
      $(tableRef.current).DataTable().destroy();
    }

    // Helper to safely convert value to number
    const intVal = (value) => {
      if (typeof value === "number") return value;
      if (typeof value !== "string") return 0;
      // Remove ₹, commas, etc.
      const cleaned = value.replace(/[^0-9.-]+/g, "");
      const num = parseFloat(cleaned);
      return isNaN(num) ? 0 : num;
    };

    const dtColumns = columns.map((col) => ({
      data: col.key,
      title: col.title,
      orderable: col.orderable !== false,
      searchable: col.searchable !== false,
      visible: col.visible !== false,
      className: col.sum ? "text-end" : col.className || "",
    }));

    // Action column
    if (hasEdit || hasDelete || hasPrint) {
      dtColumns.push({
        data: null,
        title: "Action",
        orderable: false,
        searchable: false,
        defaultContent: "",
        className: "text-center",
        render: function (data, type, row) {
          let buttons = "";
          if (hasEdit) {
            buttons += `<button class="btn btn-sm btn-primary pt-0 mt-0 pb-0 mb-0 edit-btn me-1" data-id="${row.id || ""}"><i class="bi bi-pencil"></i></button>`;
          }
          if (hasDelete) {
            buttons += `<button class="btn btn-sm btn-danger pt-0 mt-0 pb-0 mb-0 delete-btn me-1" data-id="${row.id || ""}"><i class="bi bi-trash"></i></button>`;
          }
          if (hasPrint) {
            buttons += `<button class="btn btn-sm btn-warning pt-0 mt-0 pb-0 mb-0 print-btn" data-id="${row.id || ""}"><i class="bi bi-printer"></i></button>`;
          }
          return buttons;
        },
      });
    }

    const dt = $(tableRef.current).DataTable({
      data: data,
      columns: dtColumns,

      // ─── Footer totals logic ───────────────────────────────
      footerCallback: function () {
        const api = this.api();

        columns.forEach((col, idx) => {
          if (!col.sum) return;

          // Total across **all** filtered data (not just current page)
          const total = api
            .column(idx)
            .data()
            .reduce((a, b) => intVal(a) + intVal(b), 0);

          // Format with Indian number style (1,23,456.00)
          const formatted = total.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });

          // Optional: add ₹ prefix
          // const display = total === 0 ? "-" : `₹ ${formatted}`;
          const display = total === 0 ? "0.00" : formatted;

          $(api.column(idx).footer()).html(`<strong>${display}</strong>`);
        });
      },

      buttons: [
        {
          extend: "excelHtml5",
          text: "Export Excel",
          title: (title || "List") + "_" + moment().format("YYYY-MM-DD"),
          exportOptions: {
            columns: ":not(:last-child)",
            format: {
              header: function (data, columnIdx) {
                const $temp = $("<div>" + data + "</div>");
                $temp.find("input, span").remove();
                return $temp.text().trim() || columns[columnIdx]?.title || "";
              },
            },
          },
          footer: true, // ← include footer in Excel export
        },
        {
          extend: "pdfHtml5",
          text: "Export PDF",
          title: (title || "List") + "_" + moment().format("YYYY-MM-DD"),
          orientation: "landscape",
          pageSize: "A4",
          exportOptions: { columns: ":not(:last-child)" },
          footer: true,
        },
        {
          extend: "print",
          text: "Print",
          title: title || "List",
          exportOptions: { columns: ":not(:last-child)" },
          footer: true,
        },
        {
          extend: "copy",
          text: "<i class='bi bi-copy'></i>",
          title: (title || "List") + "_" + moment().format("YYYY-MM-DD"),
        },
      ],

      dom: "Bfrtip",
      lengthChange: false,
      pageLength: 15,
      paging: true,
      searching: true,
      ordering: true,
      info: true,
      responsive: false,
      scrollX: true,
      autoWidth: true,

      initComplete: function () {
        const api = this.api();

        // Column search inputs
        api.columns().every(function (index) {
          if (index >= columns.length) return; // skip action column

          const th = $(this.header());
          const col = columns[index];

          if (th.find("input.column-search").length === 0) {
            const inputType = col.dateFilter ? "date" : "text";
            const $input = $(
              `<input type="${inputType}" placeholder="search..." class="form-control form-control-sm column-search" ` +
                `style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 5; display: none;" />`
            );

            th.append($input);

            $input.on("keyup change", function () {
              if (api.column(index).search() !== this.value) {
                api.column(index).search(this.value).draw();
              }
            });
          }
        });

        $("th input.column-search").hide();

        $("thead th").on("click", function (e) {
          if ($(e.target).is("input") || $(e.target).closest("button").length) return;

          const th = $(this);
          const $input = th.find("input.column-search");
          const $titleSpan = th.find("span.title-text");

          if ($input.length) {
            if ($input.is(":visible")) {
              $input.hide();
              $titleSpan.show();
            } else {
              $input.show().focus();
              $titleSpan.hide();
            }
          }
        });

        $("tbody").on("click", () => {
          $("th input.column-search").hide();
          $("th span.title-text").show();
        });

        // Action handlers
        if (onEdit) {
          $(tableRef.current).on("click", ".edit-btn", function (e) {
            e.stopPropagation();
            const tr = $(this).closest("tr");
            const rowData = api.row(tr).data();
            onEdit(rowData);
          });
        }

        if (onDelete) {
          $(tableRef.current).on("click", ".delete-btn", function (e) {
            e.stopPropagation();
            const tr = $(this).closest("tr");
            const rowData = api.row(tr).data();
            onDelete(rowData);
          });
        }

        if (onPrint) {
          $(tableRef.current).on("click", ".print-btn", function (e) {
            e.stopPropagation();
            const tr = $(this).closest("tr");
            const rowData = api.row(tr).data();
            onPrint(rowData);
          });
        }
      },
    });

    setTableInstance(dt);

    return () => {
      dt?.destroy(true);
    };
  }, [data, columns, title, onEdit, onDelete, onPrint, hasEdit, hasDelete, hasPrint]);

  // ─── Date Range Filter ────────────────────────────────────────
  useEffect(() => {
    if (!columns || !tableInstance) return;

    const dateFilterIndex = columns.findIndex((col) => col.dateFilter);
    if (dateFilterIndex === -1) return;

    const filterFn = (settings, data, dataIndex) => {
      if (!dateRange.startDate || !dateRange.endDate) return true;
      const dateStr = data[dateFilterIndex];
      if (!dateStr) return true;
      const empDate = moment(dateStr.trim(), "YYYY-MM-DD");
      return empDate.isValid() && empDate.isBetween(dateRange.startDate, dateRange.endDate, null, "[]");
    };

    $.fn.dataTable.ext.search.push(filterFn);
    tableInstance.draw();

    return () => {
      const idx = $.fn.dataTable.ext.search.indexOf(filterFn);
      if (idx > -1) $.fn.dataTable.ext.search.splice(idx, 1);
    };
  }, [dateRange, tableInstance, columns]);

  const handleGlobalSearch = (e) => {
    tableInstance?.search(e.target.value)?.draw();
  };

  const handlePageLengthChange = (e) => {
    const val = e.target.value;
    if (val) {
      const len = val === "All" ? -1 : parseInt(val, 10);
      tableInstance?.page.len(len).draw();
    }
  };

  return (
    <div className="card p-3 pt-1 shadow-sm">
      {title && <h5 className="mb-2 text-center text-brown p-0 m-0 fw-semibold mt-2">{title}</h5>}

      {/* Controls */}
      <div className="row align-items-center mb-3 g-3">
        <div className="col-12 col-md-4">
          <input
            className="form-control border-secondary"
            placeholder="Search..."
            onChange={handleGlobalSearch}
          />
        </div>

        {columns?.some((col) => col.dateFilter) && (
          <div className="col-12 col-md-4">
            <input
              ref={dateRef}
              className="form-control text-center border-secondary"
              readOnly
              placeholder="Select date range..."
            />
          </div>
        )}

        <div className="col-12 col-md-4 d-flex justify-content-center align-items-center flex-wrap gap-1">
          <button className="btn btn-success" onClick={() => tableInstance?.button(0).trigger()} title="Export to Excel">
            <i className="bi bi-file-earmark-excel"></i>
          </button>
          <button className="btn btn-danger" onClick={() => tableInstance?.button(1).trigger()} title="Export to PDF">
            <i className="bi bi-filetype-pdf"></i>
          </button>
          <button className="btn btn-primary" onClick={() => tableInstance?.button(2).trigger()} title="Print">
            <i className="bi bi-printer"></i>
          </button>
          <button className="btn btn-info text-white" onClick={() => tableInstance?.button(3).trigger()} title="Copy">
            <i className="bi bi-copy"></i>
          </button>

          <select className="form-select text-center" style={{ width: "auto" }} onChange={handlePageLengthChange} defaultValue="15">
            <option value="" disabled>Rows</option>
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="15">15</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="All">All</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table
          ref={tableRef}
          className="table table-striped table-hover table-bordered border-secondary mb-2 dataTable dtr-inline text-capitalize"
          style={{ minWidth: "900px" }}
        >
          <thead className="table-secondary border-bottom border-dark-subtle">
            <tr>
              {columns?.map((col) => (
                <th key={col.key} style={{ position: col.key === columns[0]?.key ? "sticky" : "relative", left: col.key === columns[0]?.key ? 0 : "auto" }}>
                  <span className="title-text" style={{ display: "block", pointerEvents: "none" }}>
                    {col.title}
                  </span>
                </th>
              ))}
              {(hasEdit || hasDelete || hasPrint) && (
                <th style={{ position: "relative" }}>
                  <span className="title-text" style={{ display: "block", pointerEvents: "none" }}>
                    Action
                  </span>
                </th>
              )}
            </tr>
          </thead>

          <tfoot>
            <tr>
              {columns?.map((col, i) => (
                <th
                  key={i}
                  className={col.sum ? "text-end fw-bold text-dark" : ""}
                  style={{ backgroundColor: col.sum ? "#e9ecef" : "inherit" }}
                />
              ))}
              {(hasEdit || hasDelete || hasPrint) && <th />}
            </tr>
          </tfoot>

          <tbody />
        </table>
      </div>
    </div>
  );
};

export default List;