import React from 'react';

const StockPagination = ({
  page,
  totalPages,
  total,
  limit,
  disabled,
  onPageChange,
}) => {
  if (!total || totalPages <= 1) {
    return null;
  }

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  const pages = [];
  const maxButtons = 5;
  let from = Math.max(1, page - 2);
  let to = Math.min(totalPages, from + maxButtons - 1);
  from = Math.max(1, to - maxButtons + 1);
  for (let i = from; i <= to; i += 1) {
    pages.push(i);
  }

  return (
    <div className="stock-pagination d-flex flex-wrap align-items-center justify-content-between gap-2 mt-3 pt-2 border-top">
      <div className="text-muted small">
        Showing {start}–{end} of {total} item(s)
      </div>
      <nav aria-label="Stock pagination">
        <ul className="pagination pagination-sm mb-0">
          <li className={`page-item ${page <= 1 || disabled ? 'disabled' : ''}`}>
            <button
              type="button"
              className="page-link"
              disabled={page <= 1 || disabled}
              onClick={() => onPageChange(page - 1)}
            >
              Previous
            </button>
          </li>
          {pages.map((p) => (
            <li key={p} className={`page-item ${p === page ? 'active' : ''}`}>
              <button
                type="button"
                className="page-link"
                disabled={disabled}
                onClick={() => onPageChange(p)}
              >
                {p}
              </button>
            </li>
          ))}
          <li
            className={`page-item ${page >= totalPages || disabled ? 'disabled' : ''}`}
          >
            <button
              type="button"
              className="page-link"
              disabled={page >= totalPages || disabled}
              onClick={() => onPageChange(page + 1)}
            >
              Next
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default StockPagination;
