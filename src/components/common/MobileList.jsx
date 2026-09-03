import React, { useMemo, useState } from "react";
import Confirm from "./Confirm";
import "../../css/MobileList.css";

/** DataTables column renders often return HTML strings — strip for mobile text. */
const toPlainText = (value) => {
  if (value == null || value === "") return "-";
  if (typeof value !== "string") return value;
  if (!/[<>]/.test(value)) return value;

  if (typeof window !== "undefined" && window.DOMParser) {
    const doc = new DOMParser().parseFromString(value, "text/html");
    const text = (doc.body?.textContent || "").trim();
    return text || "-";
  }

  return value.replace(/<[^>]*>/g, "").trim() || "-";
};

const getCellValue = (row, col) => {
  if (!col) return "-";
  const raw = row?.[col.key];
  if (typeof col.render === "function") {
    // Prefer sort/filter plain value when render supports DataTables types
    let rendered;
    try {
      rendered = col.render(raw, "sort", row);
      if (rendered == null || rendered === "" || /[<>]/.test(String(rendered))) {
        rendered = col.render(raw, "filter", row);
      }
      if (rendered == null || rendered === "" || /[<>]/.test(String(rendered))) {
        rendered = col.render(raw, "display", row);
      }
    } catch {
      rendered = col.render(raw, "display", row);
    }
    return toPlainText(rendered);
  }
  return toPlainText(raw);
};

const getRowId = (row, index) =>
  row?.row_id ||
  row?.id ||
  row?.backup_uuid ||
  row?.backup_id ||
  row?.girv_uuid ||
  row?.girv_id ||
  row?.firm_id ||
  row?.user_id ||
  row?.staff_id ||
  row?.account_id ||
  row?.rate_uuid ||
  row?.rate_id ||
  row?.purity_uuid ||
  row?.purity_id ||
  row?.ml_id ||
  row?.own_uuid ||
  row?.own_id ||
  index;

const pickColumn = (columns, key) => {
  if (!key) return null;
  return columns.find((c) => c.key === key) || null;
};

/**
 * Collapsible mobile card list — companion to desktop `List`.
 * Shown only below md breakpoint (`d-md-none`).
 */
const MobileList = ({
  data = [],
  columns = [],
  title,
  primaryKey,
  subtitleKey,
  amountKey,
  hasEdit = false,
  hasDelete = false,
  hasPrint = false,
  hasView = false,
  hasDownload = false,
  hasRestore = false,
  onEdit,
  onDelete,
  onPrint,
  onView,
  onDownload,
  onRestore,
  onCustomerHome,
  deleteConfirmMessage = "Are you sure you want to delete this record?",
  emptyMessage = "No records found",
}) => {
  const [search, setSearch] = useState("");
  const [expandedKey, setExpandedKey] = useState(null);
  const [confirmState, setConfirmState] = useState({ show: false, rowData: null });

  const titleCol = useMemo(() => {
    const byKey = pickColumn(columns, primaryKey);
    if (byKey) return byKey;
    return (
      columns.find((c) => c.key && !String(c.key).toLowerCase().endsWith("_id") && !String(c.key).toLowerCase().includes("uuid")) ||
      columns[0] ||
      null
    );
  }, [columns, primaryKey]);

  const subtitleCol = useMemo(() => {
    const byKey = pickColumn(columns, subtitleKey);
    if (byKey) return byKey;
    return columns.find((c) => c.dateFilter) || null;
  }, [columns, subtitleKey]);

  const amountCol = useMemo(() => {
    const byKey = pickColumn(columns, amountKey);
    if (byKey) return byKey;
    return (
      columns.find((c) => c.sum) ||
      columns.find((c) => /amount|amt|rate|principal|balance|total|size/i.test(c.key || "")) ||
      null
    );
  }, [columns, amountKey]);

  const cornerCol = useMemo(
    () => columns.find((c) => c.cardCorner) || null,
    [columns]
  );

  const detailColumns = useMemo(
    () =>
      columns.filter(
        (c) =>
          c.key !== titleCol?.key &&
          c.key !== subtitleCol?.key &&
          c.key !== amountCol?.key &&
          !c.cardCorner
      ),
    [columns, titleCol, subtitleCol, amountCol]
  );

  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data || [];
    return (data || []).filter((row) =>
      columns.some((col) => {
        const value = getCellValue(row, col);
        return String(value ?? "")
          .toLowerCase()
          .includes(q);
      })
    );
  }, [data, columns, search]);

  const showActions =
    hasEdit || hasDelete || hasPrint || hasView || hasDownload || hasRestore;

  const toggleRow = (key) => {
    setExpandedKey((prev) => (prev === key ? null : key));
  };

  const handleCloseConfirm = () => setConfirmState({ show: false, rowData: null });

  const handleConfirmDelete = () => {
    if (confirmState.rowData && onDelete) onDelete(confirmState.rowData);
    handleCloseConfirm();
  };

  return (
    <div className="mobile-list d-md-none">
      <Confirm
        show={confirmState.show}
        onHide={handleCloseConfirm}
        onConfirm={handleConfirmDelete}
        message={
          typeof deleteConfirmMessage === "function"
            ? deleteConfirmMessage(confirmState.rowData)
            : deleteConfirmMessage
        }
      />

      {title && (
        <div className="mobile-list__panel-header">
          <h5 className="mobile-list__title mb-0">{title}</h5>
          <span className="mobile-list__count-badge">{filteredData.length}</span>
        </div>
      )}

      <div className="mobile-list__search input-group input-group-sm mb-3">
        <span className="input-group-text border-secondary-subtle">
          <i className="bi bi-search text-muted" aria-hidden="true" />
        </span>
        <input
          type="search"
          className="form-control border-secondary-subtle"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredData.length === 0 ? (
        <div className="mobile-list__empty">{emptyMessage}</div>
      ) : (
        <div className="mobile-list__cards">
          {filteredData.map((row, index) => {
            const rowId = getRowId(row, index);
            const key = String(rowId);
            const expanded = expandedKey === key;
            const heading = titleCol ? getCellValue(row, titleCol) : `#${rowId}`;
            const subtitle = subtitleCol ? getCellValue(row, subtitleCol) : null;
            const amount = amountCol ? getCellValue(row, amountCol) : null;
            const cornerLabel = cornerCol ? getCellValue(row, cornerCol) : null;

            return (
              <article
                key={key}
                className={`mobile-list__card ${expanded ? "is-open" : ""}`}
              >
                {cornerLabel != null && cornerLabel !== "-" && (
                  <span
                    className="mobile-list__corner-badge badge status-badge status-badge--primary"
                    title={String(cornerLabel)}
                  >
                    {cornerLabel}
                  </span>
                )}
                <button
                  type="button"
                  className="mobile-list__card-main"
                  onClick={() => toggleRow(key)}
                  aria-expanded={expanded}
                >
                  <div className="mobile-list__card-left">
                    <span className="mobile-list__card-title text-truncate">
                      {heading}
                    </span>
                    {subtitle != null && subtitle !== "-" && (
                      <span className="mobile-list__card-subtitle text-truncate">
                        {subtitle}
                      </span>
                    )}
                  </div>

                  <div className="mobile-list__card-right">
                    {amount != null && amount !== "-" && (
                      <strong className="mobile-list__card-amount">{amount}</strong>
                    )}
                    <i
                      className={`bi mobile-list__chevron ${expanded ? "bi-chevron-up" : "bi-chevron-down"}`}
                      aria-hidden="true"
                    />
                  </div>
                </button>

                {expanded && (
                  <div className="mobile-list__details">
                    {detailColumns.length > 0 && (
                      <div className="mobile-list__grid">
                        {detailColumns.map((col) => (
                          <div key={`${col.key}-${col.title}`} className="mobile-list__cell">
                            <span className="mobile-list__cell-label">{col.title}</span>
                            {typeof col.renderMobile === 'function' ? (
                              col.renderMobile(row)
                            ) : col.customerHome && onCustomerHome ? (
                              <button
                                type="button"
                                className="btn btn-link p-0 text-brown fw-bold text-decoration-none mobile-list__cell-value"
                                onClick={() => onCustomerHome(row)}
                              >
                                {getCellValue(row, col)}
                              </button>
                            ) : (
                              <strong className="mobile-list__cell-value">
                                {getCellValue(row, col)}
                              </strong>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {showActions && (
                      <div className="mobile-list__actions">
                        {hasView && (
                          <button
                            type="button"
                            className="btn btn-sm btn-yellow"
                            title="View"
                            onClick={() => onView?.(row)}
                          >
                            <i className="bi bi-eye text-dark" />
                          </button>
                        )}
                        {hasDownload && (
                          <button
                            type="button"
                            className="btn btn-sm btn-info text-white"
                            title="Download"
                            onClick={() => onDownload?.(row)}
                          >
                            <i className="bi bi-download" />
                          </button>
                        )}
                        {hasRestore && (
                          <button
                            type="button"
                            className="btn btn-sm btn-success"
                            title="Restore"
                            onClick={() => onRestore?.(row)}
                          >
                            <i className="bi bi-arrow-counterclockwise" />
                          </button>
                        )}
                        {hasEdit && (
                          <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            title="Edit"
                            onClick={() => onEdit?.(row)}
                          >
                            <i className="bi bi-pencil" />
                          </button>
                        )}
                        {hasDelete && (
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            title="Delete"
                            onClick={() =>
                              setConfirmState({ show: true, rowData: row })
                            }
                          >
                            <i className="bi bi-trash" />
                          </button>
                        )}
                        {hasPrint && (
                          <button
                            type="button"
                            className="btn btn-sm btn-warning"
                            title="Print"
                            onClick={() => onPrint?.(row)}
                          >
                            <i className="bi bi-printer" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MobileList;
