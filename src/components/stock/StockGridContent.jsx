import React from 'react';
import { useNavigate } from 'react-router-dom';
import StockItemImage from './StockItemImage';
import {
  formatStockValuation,
  formatStockWeight,
  stockCustomerName,
  stockDetailsPath,
  stockLoanRef,
  stockMetalToneClass,
} from '../../utils/stockFormatters';
import { statusBadgeHtml } from '../../utils/listFormatters';

const StockGridContent = ({ rows = [], loading = false, onSelect }) => {
  const navigate = useNavigate();

  const openDetails = (row) => {
    const path = stockDetailsPath(row);
    if (path) {
      navigate(path, { state: { stockPreview: row } });
      return;
    }
    onSelect?.(row);
  };

  return (
    <div className="row g-3 position-relative stock-grid" style={{ minHeight: 200 }}>
      {loading && (
        <div
          className="position-absolute w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-50"
          style={{ zIndex: 10, top: 0, left: 0 }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading…</span>
          </div>
        </div>
      )}

      {!loading && rows.length === 0 ? (
        <div className="col-12 text-center py-5 text-muted">
          <h5 className="text-secondary">No stock items found for the selected filters.</h5>
        </div>
      ) : (
        rows.map((row) => {
          const loan = row.loan;
          return (
            <div key={row.st_uuid || row.st_id} className="col-12 col-sm-6 col-lg-4 col-xl-3">
              <div
                className="stock-card h-100"
                role="button"
                tabIndex={0}
                onClick={() => openDetails(row)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openDetails(row);
                  }
                }}
              >
                <div className="card h-100 stock-card__inner">
                  <div className="stock-card__media">
                    <StockItemImage
                      item={row}
                      alt={row.st_item_name || 'Stock item'}
                      variant="card"
                    />
                  <span
                    className={`stock-card__metal stock-metal-badge text-uppercase ${stockMetalToneClass(row.st_metal_type)}`}
                  >
                    {row.st_metal_type || '—'}
                  </span>
                  </div>
                  <div className="card-body p-3">
                    <h6 className="fw-bold text-brown mb-1 text-truncate" title={row.st_item_name}>
                      {row.st_item_name || '—'}
                    </h6>
                    <p className="mb-1 small text-muted">
                      Fine: {formatStockWeight(row.st_fine_weight, 'GM')} · Purity {row.st_purity ?? '—'}%
                    </p>
                    <p className="mb-2 fw-semibold text-success-emphasis fs-5">
                      ₹ {formatStockValuation(row)}
                    </p>
                    <div className="stock-card__meta small">
                      <div className="d-flex justify-content-between gap-2 mb-1">
                        <span className="text-muted">Loan</span>
                        <span className="fw-bold text-brown">{stockLoanRef(loan)}</span>
                      </div>
                      <div className="d-flex justify-content-between gap-2 mb-1">
                        <span className="text-muted">Customer</span>
                        <span className="text-end text-truncate ms-2">{stockCustomerName(row.user)}</span>
                      </div>
                      {row.user?.user_mobile_no && (
                        <div className="d-flex justify-content-between gap-2">
                          <span className="text-muted">Mobile</span>
                          <span>{row.user.user_mobile_no}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="card-footer bg-transparent border-top border-secondary-subtle py-2 px-3 stock-card__footer">
                    <div className="stock-card__footer-status">
                      {(loan?.girv_status || row.st_status) ? (
                        <span
                          dangerouslySetInnerHTML={{
                            __html: statusBadgeHtml(loan?.girv_status || row.st_status),
                          }}
                        />
                      ) : (
                        <span className="text-muted small">—</span>
                      )}
                    </div>
                    <div className="stock-card__footer-action">
                      <button
                        type="button"
                        className="btn btn-sm stock-details-btn stock-card__details-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDetails(row);
                        }}
                      >
                        Go to details
                        <i className="bi bi-arrow-right-short" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default StockGridContent;
