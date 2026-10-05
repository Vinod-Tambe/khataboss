import React, { useMemo } from 'react';
import moment from 'moment';
import {
  formatLoanStockLedgerCellAmt,
  formatLoanStockLedgerGirvi,
  formatLoanStockLedgerTotalAmt,
} from '../../utils/loanStockLedgerFormatters';
import '../../css/LoanStockLedger.css';

const sumRows = (rows, pick) =>
  rows.reduce((acc, row) => {
    const part = pick(row);
    return {
      amount: acc.amount + (Number(part?.amount) || 0),
      girvi: acc.girvi + (Number(part?.girvi) || 0),
    };
  }, { amount: 0, girvi: 0 });

const LoanStockLedgerReport = ({
  rows = [],
  loading = false,
  errorMessage = null,
  isPrint = false,
  inflowColumnTitle = 'RECEIVED GIRVI',
  loadingMessage = 'Loading loan stock ledger…',
  emptyMessage = 'No ledger rows for the selected period.',
}) => {
  const totals = useMemo(() => {
    if (!rows.length) return null;
    const first = rows[0];
    const last = rows[rows.length - 1];
    const received = sumRows(rows, (r) => r.received);
    const released = sumRows(rows, (r) => r.released);
    const interest = rows.reduce((sum, r) => sum + (Number(r.interest) || 0), 0);
    const opening = {
      amount: Number(first.opening?.amount) || 0,
      girvi: Number(first.opening?.girvi) || 0,
    };
    const closing = {
      amount: Number(last.final?.amount) || 0,
      girvi: Number(last.final?.girvi) || 0,
    };
    const periodTotal = {
      amount: parseFloat((opening.amount + received.amount).toFixed(2)),
      girvi: opening.girvi + received.girvi,
    };
    return {
      opening,
      received: {
        amount: parseFloat(received.amount.toFixed(2)),
        girvi: received.girvi,
      },
      periodTotal,
      released: {
        amount: parseFloat(released.amount.toFixed(2)),
        girvi: released.girvi,
      },
      closing,
      interest: parseFloat(interest.toFixed(2)),
      dayCount: rows.length,
    };
  }, [rows]);

  return (
    <div className={`loan-stock-ledger-report ${isPrint ? 'is-print' : ''}`}>
      {errorMessage && !loading && (
        <div className="alert alert-danger py-2 mb-2" role="alert">
          {errorMessage}
        </div>
      )}

      <div className="table-responsive table-responsive-custom">
        <table className="table table-bordered mb-0 loan-stock-ledger-table text-center align-middle">
          <colgroup>
            <col className="loan-stock-ledger-col loan-stock-ledger-col--date" />
            <col span={2} className="loan-stock-ledger-col loan-stock-ledger-col--opening" />
            <col span={2} className="loan-stock-ledger-col loan-stock-ledger-col--received" />
            <col span={2} className="loan-stock-ledger-col loan-stock-ledger-col--total" />
            <col span={2} className="loan-stock-ledger-col loan-stock-ledger-col--released" />
            <col span={2} className="loan-stock-ledger-col loan-stock-ledger-col--final" />
            <col className="loan-stock-ledger-col loan-stock-ledger-col--interest" />
          </colgroup>
          <thead>
            <tr className="loan-stock-ledger-table__head-main">
              <th rowSpan={2} className="loan-stock-ledger-table__date-col">DATE</th>
              <th colSpan={2} className="loan-stock-ledger-table__section-opening">OPENING BALANCE</th>
              <th colSpan={2} className="loan-stock-ledger-table__section-received">{inflowColumnTitle}</th>
              <th colSpan={2} className="loan-stock-ledger-table__section-total">TOTAL</th>
              <th colSpan={2} className="loan-stock-ledger-table__section-released">RELEASED GIRVI</th>
              <th colSpan={2} className="loan-stock-ledger-table__section-final">FINAL TOTAL</th>
              <th rowSpan={2} className="loan-stock-ledger-table__section-interest">INTEREST</th>
            </tr>
            <tr className="loan-stock-ledger-table__head-sub">
              <th className="loan-stock-ledger-table__section-opening">AMOUNT</th>
              <th className="loan-stock-ledger-table__section-opening">GIRVI</th>
              <th className="loan-stock-ledger-table__section-received">AMOUNT</th>
              <th className="loan-stock-ledger-table__section-received">GIRVI</th>
              <th className="loan-stock-ledger-table__section-total">AMOUNT</th>
              <th className="loan-stock-ledger-table__section-total">GIRVI</th>
              <th className="loan-stock-ledger-table__section-released">AMOUNT</th>
              <th className="loan-stock-ledger-table__section-released">GIRVI</th>
              <th className="loan-stock-ledger-table__section-final">AMOUNT</th>
              <th className="loan-stock-ledger-table__section-final">GIRVI</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={12} className="py-4">
                  <span className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                  {loadingMessage}
                </td>
              </tr>
            ) : rows.length > 0 ? (
              rows.map((row) => (
                <tr key={row.date}>
                  <td className="loan-stock-ledger-table__date-col fw-semibold">
                    {moment(row.date).format('DD MMM YY')}
                  </td>
                  <td className="loan-stock-ledger-table__cell-opening loan-stock-ledger-table__amt">
                    {formatLoanStockLedgerCellAmt(row.opening?.amount)}
                  </td>
                  <td className="loan-stock-ledger-table__cell-opening">
                    {formatLoanStockLedgerGirvi(row.opening?.girvi)}
                  </td>
                  <td className="loan-stock-ledger-table__cell-received loan-stock-ledger-table__amt">
                    {formatLoanStockLedgerCellAmt(row.received?.amount)}
                  </td>
                  <td className="loan-stock-ledger-table__cell-received">
                    {formatLoanStockLedgerGirvi(row.received?.girvi)}
                  </td>
                  <td className="loan-stock-ledger-table__cell-total loan-stock-ledger-table__amt">
                    {formatLoanStockLedgerCellAmt(row.total?.amount)}
                  </td>
                  <td className="loan-stock-ledger-table__cell-total">
                    {formatLoanStockLedgerGirvi(row.total?.girvi)}
                  </td>
                  <td className="loan-stock-ledger-table__cell-released loan-stock-ledger-table__amt">
                    {formatLoanStockLedgerCellAmt(row.released?.amount)}
                  </td>
                  <td className="loan-stock-ledger-table__cell-released">
                    {formatLoanStockLedgerGirvi(row.released?.girvi)}
                  </td>
                  <td className="loan-stock-ledger-table__cell-final loan-stock-ledger-table__amt">
                    {formatLoanStockLedgerCellAmt(row.final?.amount)}
                  </td>
                  <td className="loan-stock-ledger-table__cell-final">
                    {formatLoanStockLedgerGirvi(row.final?.girvi)}
                  </td>
                  <td className="loan-stock-ledger-table__cell-interest loan-stock-ledger-table__amt">
                    {formatLoanStockLedgerCellAmt(row.interest)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={12} className="py-4 text-muted">
                  {errorMessage || emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
          {!loading && totals && (
            <tfoot className="loan-stock-ledger-table__foot">
              <tr>
                <th className="loan-stock-ledger-table__date-col">
                  TOTAL ({totals.dayCount} days)
                </th>
                <th className="loan-stock-ledger-table__cell-opening loan-stock-ledger-table__amt">
                  {formatLoanStockLedgerTotalAmt(totals.opening.amount)}
                </th>
                <th className="loan-stock-ledger-table__cell-opening">
                  {formatLoanStockLedgerGirvi(totals.opening.girvi)}
                </th>
                <th className="loan-stock-ledger-table__cell-received loan-stock-ledger-table__amt">
                  {formatLoanStockLedgerTotalAmt(totals.received.amount)}
                </th>
                <th className="loan-stock-ledger-table__cell-received">
                  {formatLoanStockLedgerGirvi(totals.received.girvi)}
                </th>
                <th className="loan-stock-ledger-table__cell-total loan-stock-ledger-table__amt">
                  {formatLoanStockLedgerTotalAmt(totals.periodTotal.amount)}
                </th>
                <th className="loan-stock-ledger-table__cell-total">
                  {formatLoanStockLedgerGirvi(totals.periodTotal.girvi)}
                </th>
                <th className="loan-stock-ledger-table__cell-released loan-stock-ledger-table__amt">
                  {formatLoanStockLedgerTotalAmt(totals.released.amount)}
                </th>
                <th className="loan-stock-ledger-table__cell-released">
                  {formatLoanStockLedgerGirvi(totals.released.girvi)}
                </th>
                <th className="loan-stock-ledger-table__cell-final loan-stock-ledger-table__amt">
                  {formatLoanStockLedgerTotalAmt(totals.closing.amount)}
                </th>
                <th className="loan-stock-ledger-table__cell-final">
                  {formatLoanStockLedgerGirvi(totals.closing.girvi)}
                </th>
                <th className="loan-stock-ledger-table__cell-interest loan-stock-ledger-table__amt">
                  {formatLoanStockLedgerTotalAmt(totals.interest)}
                </th>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

export default LoanStockLedgerReport;
