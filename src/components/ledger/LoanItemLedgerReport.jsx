import React, { useMemo } from 'react';
import moment from 'moment';
import { formatListAmt, statusBadgeHtml } from '../../utils/listFormatters';
import { resolveImageUrl } from '../../utils/imageHelpers';
import { getStockDetailId } from '../../utils/stockFormatters';

const formatWeight = (weight, type) => {
  const w = parseFloat(weight) || 0;
  const unit = type || 'GM';
  return `${w.toFixed(3)} ${unit}`;
};

const LoanItemLedgerReport = ({
  rows = [],
  loading = false,
  errorMessage = null,
  onOpenLoanDetails,
  onOpenStockDetails,
  isPrint = false,
}) => {
  const totals = useMemo(() => {
    let valuation = 0;
    let fineWeight = 0;
    rows.forEach((row) => {
      valuation += parseFloat(row.st_final_valuation || row.st_valuation) || 0;
      fineWeight += parseFloat(row.st_fine_weight) || 0;
    });
    return { count: rows.length, valuation, fineWeight };
  }, [rows]);

  const loanRef = (loan) =>
    loan?.girv_unique_code || loan?.girv_loan_no || (loan?.girv_id ? `LN-${loan.girv_id}` : '-');

  const customerName = (row) => {
    const u = row?.user;
    if (!u) return '-';
    return `${u.user_first_name || ''} ${u.user_last_name || ''}`.trim() || '-';
  };

  return (
    <div className="table-responsive table-responsive-custom">
      {errorMessage && !loading && (
        <div className="alert alert-danger py-2 mb-2" role="alert">
          {errorMessage}
        </div>
      )}

      <table className="table table-hover table-bordered border-secondary mb-2 dataTable dtr-inline dynamic-data-table">
        <thead className="table-secondary border-bottom border-dark-subtle">
          <tr className="bg-danger text-white">
            <th className="sticky-col">SR</th>
            {!isPrint && <th>IMAGE</th>}
            <th>METAL</th>
            <th>ITEM</th>
            <th className="text-center">QTY</th>
            <th className="text-end">GS WT</th>
            <th className="text-end">NT WT</th>
            <th className="text-center">PURITY</th>
            <th className="text-end">FINE WT</th>
            <th className="text-end">VALUATION (₹)</th>
            <th>LOAN NO</th>
            <th>CUSTOMER</th>
            <th>LOCKER</th>
            <th>PLEDGE DATE</th>
            <th>LOAN STATUS</th>
            <th>ITEM STATUS</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={isPrint ? 15 : 16} className="text-center py-4">
                <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                Loading item ledger…
              </td>
            </tr>
          ) : rows.length > 0 ? (
            rows.map((row, index) => {
              const imgUrl = resolveImageUrl(row.st_image);
              const loan = row.loan;
              const rowKey = row.st_id ?? row.st_uuid ?? index;
              const stockDetailId = getStockDetailId(row);
              const openStock =
                !isPrint && onOpenStockDetails && stockDetailId
                  ? () => onOpenStockDetails(row)
                  : null;

              return (
                <tr
                  key={rowKey}
                  className={openStock ? 'cursor-pointer' : undefined}
                  onClick={openStock || undefined}
                  role={openStock ? 'button' : undefined}
                  tabIndex={openStock ? 0 : undefined}
                  onKeyDown={
                    openStock
                      ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            openStock();
                          }
                        }
                      : undefined
                  }
                >
                  <td className="sticky-col text-center">{index + 1}</td>
                  {!isPrint && (
                    <td className="text-center" style={{ width: 56 }}>
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt=""
                          style={{
                            width: 44,
                            height: 44,
                            objectFit: 'cover',
                            borderRadius: 6,
                          }}
                        />
                      ) : (
                        <span className="text-muted small">—</span>
                      )}
                    </td>
                  )}
                  <td className="text-uppercase">{row.st_metal_type || '-'}</td>
                  <td>{row.st_item_name || '-'}</td>
                  <td className="text-center">{row.st_quantity ?? '-'}</td>
                  <td className="text-end">{formatWeight(row.st_gs_weight, row.st_gs_type)}</td>
                  <td className="text-end">{formatWeight(row.st_nt_weight, row.st_nt_type)}</td>
                  <td className="text-center">{row.st_purity ?? '-'}</td>
                  <td className="text-end">{formatListAmt(row.st_fine_weight)}</td>
                  <td className="text-end fw-semibold">
                    {formatListAmt(row.st_final_valuation || row.st_valuation)}
                  </td>
                  <td>
                    {!isPrint && onOpenLoanDetails && loan?.girv_id ? (
                      <button
                        type="button"
                        className="btn btn-link p-0 border-0 text-brown fw-bold text-decoration-none"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenLoanDetails(
                            { ...loan, user: row.user },
                            row.user
                          );
                        }}
                        title="Open loan details (customer home)"
                      >
                        {loanRef(loan)}
                      </button>
                    ) : (
                      loanRef(loan)
                    )}
                  </td>
                  <td>{customerName(row)}</td>
                  <td>{loan?.girv_locker_no || loan?.girv_packet_no || '-'}</td>
                  <td className="text-center">
                    {loan?.girv_start_date
                      ? moment(loan.girv_start_date).format('DD-MM-YYYY')
                      : row.st_add_date || '-'}
                  </td>
                  <td>
                    {loan?.girv_status ? (
                      <span
                        dangerouslySetInnerHTML={{
                          __html: statusBadgeHtml(loan.girv_status),
                        }}
                      />
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="text-uppercase">{row.st_status || '-'}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={isPrint ? 15 : 16} className="text-center py-4 text-muted">
                {errorMessage || 'No pledged items found for the selected filters.'}
              </td>
            </tr>
          )}
        </tbody>
        {!loading && rows.length > 0 && (
          <tfoot>
            <tr className="bg-blue fw-bold">
              <th colSpan={isPrint ? 8 : 9} className="text-center text-white">
                TOTAL ({totals.count} items)
              </th>
              <th className="text-end text-white">{formatListAmt(totals.fineWeight)}</th>
              <th className="text-end text-white">{formatListAmt(totals.valuation)}</th>
              <th colSpan={5} />
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
};

export default LoanItemLedgerReport;
