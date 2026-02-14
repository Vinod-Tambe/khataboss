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

const List = ({ data, columns, title, onEdit, onDelete, onPrint, hasEdit, hasDelete, hasPrint }) => {
  const tableRef = useRef(null);
  const dateRef = useRef(null);
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
  const [tableInstance, setTableInstance] = useState(null);

  // Date Range Picker (unchanged)
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

  // DataTable Initialization
  useEffect(() => {
    if (!tableRef.current || !data || !columns) return;

    if ($.fn.DataTable.isDataTable(tableRef.current)) {
      $(tableRef.current).DataTable().destroy();
    }

    const dtColumns = columns.map(col => ({
      data: col.key,
      title: col.title,
      orderable: col.orderable !== false,
      searchable: col.searchable !== false,
      visible: col.visible !== false,
    }));

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
            buttons += `<button class="btn btn-sm btn-primary pt-0 mt-0 pb-0 mb-0 edit-btn me-1" data-id="${row.id}"><i class="bi bi-pencil"></i></button>`;
          }
          if (hasDelete) {
            buttons += `<button class="btn btn-sm btn-danger pt-0 mt-0 pb-0 mb-0 delete-btn me-1" data-id="${row.id}"><i class="bi bi-trash"></i></button>`;
          }
          if (hasPrint) {
            buttons += `<button class="btn btn-sm btn-warning pt-0 mt-0 pb-0 mb-0 print-btn" data-id="${row.id}"><i class="bi bi-printer"></i></button>`;
          }
          return buttons;
        },
      });
    }

    const dt = $(tableRef.current).DataTable({
      data: data,
      columns: dtColumns,
      buttons: [
        {
          extend: "excelHtml5",
          text: "Export Excel",
          title: (title || "List") + "_" + moment().format("YYYY-MM-DD"),
          exportOptions: {
            columns: ':not(:last-child)',
            format: {
              header: function (data, columnIdx) {
                // Extract only clean text for export (removes input/span tags)
                const $temp = $('<div>' + data + '</div>');
                $temp.find('input, span').remove();
                return $temp.text().trim() || columns[columnIdx]?.title || '';
              }
            }
          },
          footer: false,
        },
        {
          extend: "pdfHtml5",
          text: "Export PDF",
          title: (title || "List") + "_" + moment().format("YYYY-MM-DD"),
          orientation: "landscape",
          pageSize: "A4",
          exportOptions: { columns: ':not(:last-child)' },
        },
        {
          extend: "print",
          text: "Print",
          title: title || "List",
          exportOptions: { columns: ':not(:last-child)' },
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

        // Add search inputs (absolute positioned)
        api.columns().every(function (index) {
          if (index >= columns.length) return; // skip action column

          const th = $(this.header());
          const col = columns[index];

          // Prevent duplicate inputs
          if (th.find('input.column-search').length === 0) {
            const inputType = col.dateFilter ? 'date' : 'text';
            const $input = $(
              `<input type="${inputType}" placeholder="search..." class="form-control form-control-sm column-search" ` +
              `style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 5; display: none;" />`
            );

            th.append($input);

            // Bind search
            $input.on("keyup change", function () {
              if (api.column(index).search() !== this.value) {
                api.column(index).search(this.value).draw();
              }
            });
          }
        });

        // Initial state: hide inputs, show titles
        $('th input.column-search').hide();

        // Toggle: click header → show input + hide title text
        $('thead th').on('click', function (e) {
          // Prevent when clicking inside input or action buttons
          if ($(e.target).is('input') || $(e.target).closest('button').length) {
            return;
          }

          const th = $(this);
          const $input = th.find('input.column-search');
          const $titleSpan = th.find('span.title-text');

          if ($input.length) {
            if ($input.is(':visible')) {
              // Hide input, show title
              $input.hide();
              $titleSpan.show();
            } else {
              // Show input, hide title
              $input.show().focus();
              $titleSpan.hide();
            }
          }
        });

        // Hide all inputs when clicking in tbody
        $('tbody').on('click', function () {
          $('th input.column-search').hide();
          $('th span.title-text').show();
        });

        // Double-click header → sort (optional)
        $('thead th').on('dblclick', function (e) {
          if ($(e.target).is('input')) return;
          const columnIndex = $(this).index();
          const currentOrder = api.order();
          let direction = 'asc';
          if (currentOrder.length > 0 && currentOrder[0][0] === columnIndex) {
            direction = currentOrder[0][1] === 'asc' ? 'desc' : 'asc';
          }
          api.order([columnIndex, direction]).draw();
        });

        // Action button handlers
        if (onEdit) {
          $(tableRef.current).on("click", ".edit-btn", function (e) {
            e.stopPropagation();
            const tr = $(this).closest('tr');
            const rowData = api.row(tr).data();
            onEdit(rowData);
          });
        }

        if (onDelete) {
          $(tableRef.current).on("click", ".delete-btn", function (e) {
            e.stopPropagation();
            const tr = $(this).closest('tr');
            const rowData = api.row(tr).data();
            onDelete(rowData);
          });
        }

        if (onPrint) {
          $(tableRef.current).on("click", ".print-btn", function (e) {
            e.stopPropagation();
            const tr = $(this).closest('tr');
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

  // Date Range Filter (unchanged)
  useEffect(() => {
    if (!columns) return;
    const dateFilterIndex = columns.findIndex(col => col.dateFilter);
    if (dateFilterIndex === -1) return;

    const filterFn = (settings, data, dataIndex) => {
      if (!dateRange.startDate || !dateRange.endDate) return true;
      const dateStr = data[dateFilterIndex];
      if (!dateStr) return true;
      const empDate = moment(dateStr.trim(), "YYYY-MM-DD");
      return empDate.isValid() && empDate.isBetween(dateRange.startDate, dateRange.endDate, null, "[]");
    };

    $.fn.dataTable.ext.search.push(filterFn);
    tableInstance?.draw();

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

      {/* Control Row */}
      <div className="row align-items-center mb-3 g-3">
        <div className="col-12 col-md-4">
          <input
            className="form-control border-secondary"
            placeholder="Search..."
            onChange={handleGlobalSearch}
          />
        </div>

        {columns && columns.some(col => col.dateFilter) && (
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

          <button className="btn btn-info text-white" onClick={() => tableInstance?.button(3).trigger()} title="Copy to Clipboard">
            <i className="bi bi-copy"></i>
          </button>

          <select
            className="form-select text-center"
            style={{ width: "auto" }}
            onChange={handlePageLengthChange}
            defaultValue="15"
          >
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
              {columns && columns.map((col, index) => (
                <th key={col.key} style={{ position: index === 0 ? "sticky" : "relative"}}>
                  <span className="title-text" style={{ display: "block", pointerEvents: "none" }}>
                    {col.title}
                  </span>
                </th>
              ))}
              {(hasEdit || hasDelete || hasPrint) && (
                <th style={{ position: "relative" }}>
                  <span className="title-text" style={{ display: "block", pointerEvents: "none" }}>Action</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody />
        </table>
      </div>
    </div>
  );
};

export default List;