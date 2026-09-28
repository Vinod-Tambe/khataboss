import React, { useMemo } from 'react';
import moment from 'moment';
import { formatListAmt, getLoanListMetrics, statusBadgeHtml } from '../../utils/listFormatters';

const formatMoney = (value) => formatListAmt(value);

const LoanLedgerReport = ({
  rows = [],
  loading = false,
  errorMessage = null,
  onViewStatement,
  onSelectLoan,
  onOpenLoanDetails,
  selectedLoanId = null,
  isPrint = false,
}) => {
  const totals = useMemo(() => {
    let principal = 0;
    let outstanding = 0;
    rows.forEach((loan) => {
      const metrics = getLoanListMetrics(loan);
      principal += Number(metrics.principal) || 0;
      outstanding += Number(metrics.finalPay) || 0;
    });
    return { count: rows.length, principal, outstanding };
  }, [rows]);

  const customerName = (loan) => {
    const u = loan?.user;
    if (!u) return '-';
    return `${u.user_first_name || ''} ${u.user_last_name || ''}`.trim() || '-';
  };

  const loanRef = (loan) =>
    loan?.girv_unique_code || loan?.girv_loan_no || (loan?.girv_id ? `LN-${loan.girv_id}` : '-');

  return (
    <div className="table-responsive table-responsive-custom">
      {errorMessage && !loading && (
        <div className="alert alert-danger py-2 mb-2" role="alert">
          {errorMessage}
        </div>
      )}

      <table className="table table-hover table-bordered border-secondary mb-2 dataTable dtr-inline text-capitalize dynamic-data-table">
        <thead className="table-secondary border-bottom border-dark-subtle">
          <tr className="bg-danger text-white">
            <th className="sticky-col">SR.NO</th>
            <th>LOAN NO</th>
            <th>DATE</th>
            <th>CUSTOMER</th>
            <th>MOBILE</th>
            <th>FIRM</th>
            <th>TYPE</th>
            <th className="text-end">PRINCIPAL</th>
            <th className="text-end">INTEREST</th>
            <th className="text-end">OUTSTANDING</th>
            <th>STATUS</th>
            {!isPrint && <th className="text-center">ACTION</th>}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={isPrint ? 11 : 12} className="text-center py-4">
                <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                Loading loan ledger…
              </td>
            </tr>
          ) : rows.length > 0 ? (
            rows.map((loan, index) => {
              const metrics = getLoanListMetrics(loan);
              const typeLabel =
                String(loan.girv_type || '').toLowerCase() === 'unsecured'
                  ? 'Unsecured'
                  : 'Secured';
              const isSelected =
                selectedLoanId != null && loan.girv_id === selectedLoanId;
              return (
                <tr
                  key={loan.girv_id ?? loan.girv_uuid ?? index}
                  className={!isPrint && isSelected ? 'table-active' : undefined}
                  style={!isPrint ? { cursor: 'pointer' } : undefined}
                  onClick={
                    !isPrint
                      ? () => onSelectLoan?.(loan)
                      : undefined
                  }
                >
                  <td className="sticky-col text-center">{index + 1}</td>
                  <td>
                    {!isPrint && onOpenLoanDetails ? (
                      <button
                        type="button"
                        className="btn btn-link p-0 border-0 text-brown fw-bold text-decoration-none"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenLoanDetails(loan);
                        }}
                        title="Open loan details (customer home)"
                      >
                        {loanRef(loan)}
                      </button>
                    ) : (
                      loanRef(loan)
                    )}
                  </td>
                  <td className="text-center">
                    {loan.girv_start_date
                      ? moment(loan.girv_start_date).format('DD-MM-YYYY')
                      : '-'}
                  </td>
                  <td>{customerName(loan)}</td>
                  <td>{loan.user?.user_mobile_no || '-'}</td>
                  <td>{loan.firm?.firm_name || '-'}</td>
                  <td>{typeLabel}</td>
                  <td className="text-end">{formatMoney(metrics.principal)}</td>
                  <td className="text-end">{formatMoney(metrics.interest)}</td>
                  <td className="text-end fw-bold">{formatMoney(metrics.finalPay)}</td>
                  <td>
                    <span
                      dangerouslySetInnerHTML={{
                        __html: statusBadgeHtml(loan.girv_status),
                      }}
                    />
                  </td>
                  {!isPrint && (
                    <td className="text-center">
                      <button
                        type="button"
                        className="btn btn-sm btn-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewStatement?.(loan);
                        }}
                      >
                        View Ledger
                      </button>
                    </td>
                  )}
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={isPrint ? 11 : 12} className="text-center py-4 text-muted">
                {errorMessage || 'No loans found for the selected filters.'}
              </td>
            </tr>
          )}
        </tbody>
        {!loading && rows.length > 0 && (
          <tfoot>
            <tr className="bg-blue fw-bold">
              <th colSpan={7} className="text-center text-white">
                TOTAL ({totals.count} loans)
              </th>
              <th className="text-end text-white">{formatMoney(totals.principal)}</th>
              <th className="text-end text-white">—</th>
              <th className="text-end text-white">{formatMoney(totals.outstanding)}</th>
              <th colSpan={isPrint ? 1 : 2} />
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
};

export default LoanLedgerReport;
