import React, { useMemo } from 'react';
import moment from 'moment';
import {
  formatLoanStockLedgerCellAmt,
  formatLoanStockLedgerTotalAmt,
} from '../../utils/loanStockLedgerFormatters';
import '../../css/LoanStockLedger.css';
import '../../css/InterestLedger.css';

const InterestLedgerReport = ({
  rows = [],
  loading = false,
  errorMessage = null,
  isPrint = false,
}) => {
  const totals = useMemo(() => {
    if (!rows.length) return null;
    const first = rows[0];
    const last = rows[rows.length - 1];
    const received = rows.reduce((s, r) => s + (Number(r.received) || 0), 0);
    const paid = rows.reduce((s, r) => s + (Number(r.paid) || 0), 0);
    return {
      opening: Number(first.opening) || 0,
      received: parseFloat(received.toFixed(2)),
      paid: parseFloat(paid.toFixed(2)),
      final: Number(last.final) || 0,
      dayCount: rows.length,
    };
  }, [rows]);

  return (
    <div className={`interest-ledger-report loan-stock-ledger-report ${isPrint ? 'is-print' : ''}`}>
      {errorMessage && !loading && (
        <div className="alert alert-danger py-2 mb-2" role="alert">
          {errorMessage}
        </div>
      )}

      <div className="table-responsive table-responsive-custom">
        <table className="table table-bordered mb-0 loan-stock-ledger-table interest-ledger-table text-center align-middle">
          <thead>
            <tr className="loan-stock-ledger-table__head-main">
              <th className="loan-stock-ledger-table__date-col">DATE</th>
              <th className="interest-ledger-table__section-opening">OPENING BALANCE</th>
              <th className="interest-ledger-table__section-received">RECEIVED INTEREST</th>
              <th className="interest-ledger-table__section-paid">INTEREST PAID</th>
              <th className="interest-ledger-table__section-final">FINAL TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="py-4">
                  <span className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                  Loading interest ledger…
                </td>
              </tr>
            ) : rows.length > 0 ? (
              rows.map((row) => (
                <tr key={row.date}>
                  <td className="loan-stock-ledger-table__date-col fw-semibold text-start">
                    {moment(row.date).format('DD MMM YY')}
                  </td>
                  <td className="interest-ledger-table__cell-opening loan-stock-ledger-table__amt">
                    {formatLoanStockLedgerCellAmt(row.opening)}
                  </td>
                  <td className="interest-ledger-table__cell-received loan-stock-ledger-table__amt">
                    {formatLoanStockLedgerCellAmt(row.received)}
                  </td>
                  <td className="interest-ledger-table__cell-paid loan-stock-ledger-table__amt">
                    {formatLoanStockLedgerCellAmt(row.paid)}
                  </td>
                  <td className="interest-ledger-table__cell-final loan-stock-ledger-table__amt">
                    {formatLoanStockLedgerCellAmt(row.final)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-4 text-muted">
                  {errorMessage || 'No interest ledger rows for the selected period.'}
                </td>
              </tr>
            )}
          </tbody>
          {!loading && totals && (
            <tfoot className="loan-stock-ledger-table__foot">
              <tr>
                <th className="loan-stock-ledger-table__date-col text-start">
                  Total ({totals.dayCount} days)
                </th>
                <th className="interest-ledger-table__cell-opening loan-stock-ledger-table__amt">
                  {formatLoanStockLedgerTotalAmt(totals.opening)}
                </th>
                <th className="interest-ledger-table__cell-received loan-stock-ledger-table__amt">
                  {formatLoanStockLedgerTotalAmt(totals.received)}
                </th>
                <th className="interest-ledger-table__cell-paid loan-stock-ledger-table__amt">
                  {formatLoanStockLedgerTotalAmt(totals.paid)}
                </th>
                <th className="interest-ledger-table__cell-final loan-stock-ledger-table__amt">
                  {formatLoanStockLedgerTotalAmt(totals.final)}
                </th>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

export default InterestLedgerReport;
