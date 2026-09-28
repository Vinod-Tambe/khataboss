import React from 'react';
import moment from 'moment';
import { buildLoanInvoiceData } from '../loan/invoice/buildLoanInvoiceData';
import PledgedItemsTable from './PledgedItemsTable';
import { getLoanItems } from '../../utils/loanItems';

/**
 * Loan ledger statement (transaction register) — aligned with account ledger columns.
 */
const LoanLedgerStatement = ({
  loanDetails,
  customer,
  periodStart,
  periodEnd,
  firmName,
  onOpenLoanDetails,
}) => {
  const data = loanDetails ? buildLoanInvoiceData(loanDetails, customer) : null;

  if (!data) {
    return (
      <div className="text-center py-4 text-muted">Unable to build loan ledger statement.</div>
    );
  }

  const { firm, customer: cust, meta, status, loan, transactions, summary, isUnsecured } =
    data;
  const pledgedCount = getLoanItems(loanDetails).length;
  const loanRefLabel = meta?.loanRef || loan?.loanNumber || '-';

  const periodLabel =
    periodStart && periodEnd
      ? `${moment(periodStart).format('DD-MM-YYYY')} To ${moment(periodEnd).format('DD-MM-YYYY')}`
      : meta?.statementDate || '-';

  return (
    <div className="loan-ledger-statement">
      <div className="text-center mb-3 border-bottom pb-3">
        <h4 className="text-brown fw-bold mb-1">Loan Ledger Statement</h4>
        <p className="mb-0 fw-semibold">{firm?.name || firmName || '-'}</p>
        <p className="mb-0 small text-muted">{firm?.address || ''}</p>
        <p className="mb-0 mt-2">
          <strong>Loan No:</strong>{' '}
          {onOpenLoanDetails && loanDetails?.girv_id ? (
            <button
              type="button"
              className="btn btn-link p-0 align-baseline text-brown fw-bold text-decoration-none"
              onClick={() => onOpenLoanDetails(loanDetails, customer || loanDetails?.user)}
            >
              {loanRefLabel}
            </button>
          ) : (
            loanRefLabel
          )}
          &nbsp;|&nbsp;
          <strong>Status:</strong> {status || '-'}
        </p>
        <p className="mb-0">
          <strong>Customer:</strong> {cust?.name || '-'} &nbsp;|&nbsp;
          <strong>Mobile:</strong> {cust?.mobile || '-'}
        </p>
        <p className="mb-0">
          <strong>Period:</strong> {periodLabel}
          &nbsp;|&nbsp;
          <strong>Statement Date:</strong> {meta?.statementDate || '-'}
        </p>
        <p className="mb-0 small">
          ROI: {loan?.roi || '-'} &nbsp;|&nbsp; Method: {loan?.interestMethod || '-'}
          &nbsp;|&nbsp; Locker: {meta?.lockerNo || '-'} &nbsp;|&nbsp; Packet:{' '}
          {meta?.packetNo || '-'}
        </p>
      </div>

      <div className="table-responsive table-responsive-custom mb-3">
        <table className="table table-hover table-bordered border-secondary mb-0 dynamic-data-table">
          <thead className="table-secondary">
            <tr className="bg-danger text-white">
              <th>SR</th>
              <th>DATE</th>
              <th>TYPE</th>
              <th>DETAILS</th>
              <th>PAYMENT MODE</th>
              <th className="text-end">PRINCIPAL (₹)</th>
              <th className="text-end">INTEREST (₹)</th>
              <th className="text-end">DISCOUNT (₹)</th>
              <th className="text-end">EXTRA (₹)</th>
              <th className="text-end">BALANCE (₹)</th>
            </tr>
          </thead>
          <tbody>
            {transactions?.length > 0 ? (
              transactions.map((txn, idx) => (
                <tr key={idx}>
                  <td className="text-center">{idx + 1}</td>
                  <td className="text-center">{txn.date}</td>
                  <td>{txn.type}</td>
                  <td>{txn.description}</td>
                  <td>{txn.paymentMode}</td>
                  <td className="text-end">{txn.principal}</td>
                  <td className="text-end">{txn.interest}</td>
                  <td className="text-end">{txn.discount || '0.00'}</td>
                  <td className="text-end">{txn.extra || '0.00'}</td>
                  <td className="text-end fw-bold">{txn.balance}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="text-center text-muted py-3">
                  No transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pledgedCount > 0 && (
        <PledgedItemsTable loanDetails={loanDetails} className="mb-3" />
      )}

      <div className="row g-2 small border-top pt-3">
        <div className="col-md-6">
          <div>
            <strong>Outstanding Principal:</strong> {summary?.outstandingPrincipal}
          </div>
          <div>
            <strong>Interest Due:</strong> {summary?.totalInterestDue}
          </div>
        </div>
        <div className="col-md-6 text-md-end">
          <div>
            <strong>Total Payable:</strong> {summary?.totalPayable}
          </div>
          {!isUnsecured && (
            <div>
              <strong>Stock Valuation:</strong> {summary?.totalValuation}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoanLedgerStatement;
