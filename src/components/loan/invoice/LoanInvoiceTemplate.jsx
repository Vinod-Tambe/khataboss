import React from 'react';
import '../../../css/LoanInvoice.css';

const statusClass = (status) => {
  const key = (status || '').toLowerCase();
  if (key === 'released') return 'loan-invoice-status--released';
  if (key === 'transferred') return 'loan-invoice-status--transferred';
  return 'loan-invoice-status--active';
};

const typeClass = (type) => {
  switch (type) {
    case 'Opening Balance':
      return 'loan-invoice-type--opening';
    case 'Deposit':
      return 'loan-invoice-type--deposit';
    case 'Additional Principal':
      return 'loan-invoice-type--additional';
    case 'Release Loan':
      return 'loan-invoice-type--release';
    case 'Transfer Loan':
      return 'loan-invoice-type--transfer';
    default:
      return 'loan-invoice-type--opening';
  }
};

/**
 * Static, reusable loan invoice layout.
 * Pass a normalized `data` object from buildLoanInvoiceData().
 */
const LoanInvoiceTemplate = ({ data }) => {
  if (!data) return null;

  const {
    firm,
    customer,
    meta,
    status,
    isUnsecured,
    loan,
    items,
    itemsTotal,
    transactions,
    transfer,
    summary,
  } = data;

  const firmInitials = (firm?.name || 'FL')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

  return (
    <div className="loan-invoice">
      {/* Brand */}
      <div className="loan-invoice-brand">
        {firm?.logoUrl ? (
          <img src={firm.logoUrl} alt={firm.name} className="loan-invoice-logo" />
        ) : (
          <div className="loan-invoice-logo-fallback">{firmInitials || 'FL'}</div>
        )}
        <div className="loan-invoice-brand-text">
          <h1>{firm?.name || 'Firm Name'}</h1>
          <p>Loan Statement / Invoice</p>
        </div>
      </div>

      {/* Firm + Customer */}
      <div className="loan-invoice-parties">
        <div className="loan-invoice-party">
          <h3>Firm Details</h3>
          <p className="party-name">{firm?.name || '-'}</p>
          <p className="muted">{firm?.address || '-'}</p>
          <p>Phone: {firm?.phone || '-'}</p>
          <p>Email: {firm?.email || '-'}</p>
          {firm?.website && firm.website !== '-' && <p>Web: {firm.website}</p>}
        </div>
        <div className="loan-invoice-party">
          <h3>Customer Details</h3>
          <p className="party-name">{customer?.name || '-'}</p>
          <p className="muted">{customer?.address || '-'}</p>
          <p>Account ID: {customer?.accountId || '-'}</p>
          <p>Mobile: {customer?.mobile || '-'}</p>
          <p>Statement Date: {meta?.statementDate || '-'}</p>
          <p>Loan Ref: {meta?.loanRef || '-'}</p>
        </div>
      </div>

      {/* Status */}
      <div className="loan-invoice-status-wrap">
        <span className={`loan-invoice-status ${statusClass(status)}`}>
          Current Loan Status: {status || 'ACTIVE'}
        </span>
      </div>

      {/* Quick meta */}
      <div className="loan-invoice-meta-grid">
        <div className="loan-invoice-meta-chip">
          <span>Packet No</span>
          <strong>{meta?.packetNo || '-'}</strong>
        </div>
        <div className="loan-invoice-meta-chip">
          <span>Locker No</span>
          <strong>{meta?.lockerNo || '-'}</strong>
        </div>
        <div className="loan-invoice-meta-chip">
          <span>Interest Method</span>
          <strong>{loan?.interestMethod || '-'}</strong>
        </div>
        <div className="loan-invoice-meta-chip">
          <span>Interest Option</span>
          <strong>{loan?.roiType || '-'}</strong>
        </div>
      </div>

      {/* Loan Details */}
      <div className="loan-invoice-section">
        <h4 className="loan-invoice-section-title">Loan Details</h4>
        <table className="loan-invoice-table">
          <thead>
            <tr>
              <th>Loan Number</th>
              <th>Date of Loan</th>
              <th>Rate of Interest</th>
              <th className="text-right">Total Principal</th>
              <th className="text-right">Processing</th>
              <th className="text-right">Charges</th>
              <th className="text-center">Period</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{loan?.loanNumber || '-'}</td>
              <td>{loan?.startDate || '-'}</td>
              <td>{loan?.roi || '-'}</td>
              <td className="text-right">₹ {loan?.originalPrincipal || '0.00'}</td>
              <td className="text-right">₹ {loan?.processingAmt || '0.00'}</td>
              <td className="text-right">₹ {loan?.chargeAmt || '0.00'}</td>
              <td className="text-center">{loan?.timePeriod || '-'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Mortgaged Items */}
      {!isUnsecured && (
        <div className="loan-invoice-section">
          <h4 className="loan-invoice-section-title">Stock Available / Mortgaged Items</h4>
          <table className="loan-invoice-table">
            <thead>
              <tr>
                <th>Metal</th>
                <th>Item Description</th>
                <th className="text-center">Qty</th>
                <th className="text-right">GS WT</th>
                <th className="text-right">NT WT</th>
                <th className="text-center">Purity</th>
                <th className="text-right">FN WT</th>
                <th className="text-right">Valuation (₹)</th>
              </tr>
            </thead>
            <tbody>
              {items?.length > 0 ? (
                items.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.metalType}</td>
                    <td>{item.description}</td>
                    <td className="text-center">{item.quantity}</td>
                    <td className="text-right">{item.gsWeight}</td>
                    <td className="text-right">{item.ntWeight}</td>
                    <td className="text-center">{item.purity}</td>
                    <td className="text-right">{item.fineWeight}</td>
                    <td className="text-right">{item.valuation}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="loan-invoice-empty">
                    No mortgaged items
                  </td>
                </tr>
              )}
            </tbody>
            {items?.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan="3">Total</td>
                  <td colSpan="4" className="text-right">
                    Total Weight: {itemsTotal?.weight}
                  </td>
                  <td className="text-right">{itemsTotal?.valuation}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}

      {/* Transaction Details */}
      <div className="loan-invoice-section">
        <h4 className="loan-invoice-section-title">Transaction Details</h4>
        <table className="loan-invoice-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Transaction Type</th>
              <th>Description</th>
              <th>Payment Mode</th>
              <th className="text-right">Principal (₹)</th>
              <th className="text-right">Interest (₹)</th>
              <th className="text-right">Balance (₹)</th>
            </tr>
          </thead>
          <tbody>
            {transactions?.length > 0 ? (
              transactions.map((txn, idx) => (
                <tr key={idx}>
                  <td>{txn.date}</td>
                  <td>
                    <span className={`loan-invoice-type ${typeClass(txn.type)}`}>{txn.type}</span>
                  </td>
                  <td>{txn.description}</td>
                  <td>{txn.paymentMode}</td>
                  <td className="text-right">{txn.principal}</td>
                  <td className="text-right">{txn.interest}</td>
                  <td className="text-right">{txn.balance}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="loan-invoice-empty">
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Transfer info */}
      {transfer && (
        <div className="loan-invoice-transfer-box">
          <strong>Transfer Loan Details</strong>
          <div>{transfer.info}</div>
          <div className="mt-1">
            Target Firm ID: <strong>{transfer.targetFirmId}</strong>
            &nbsp;&nbsp;|&nbsp;&nbsp; New Loan ID: <strong>{transfer.newLoanId}</strong>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="loan-invoice-bottom">
        <div className="loan-invoice-summary">
          <div className="loan-invoice-summary-title">Total Summary</div>
          <div className="loan-invoice-summary-row">
            <span>Total Principal Paid</span>
            <span>₹ {summary?.totalPrincipalPaid}</span>
          </div>
          <div className="loan-invoice-summary-row">
            <span>Current Outstanding Principal</span>
            <span>₹ {summary?.outstandingPrincipal}</span>
          </div>
          <div className="loan-invoice-summary-row">
            <span>Total Interest</span>
            <span>₹ {summary?.totalInterest}</span>
          </div>
          <div className="loan-invoice-summary-row">
            <span>Interest Paid</span>
            <span>₹ {summary?.totalInterestPaid}</span>
          </div>
          <div className="loan-invoice-summary-row">
            <span>Interest Due</span>
            <span>₹ {summary?.totalInterestDue}</span>
          </div>
          {!isUnsecured && (
            <>
              <div className="loan-invoice-summary-row">
                <span>Items Valuation</span>
                <span>₹ {summary?.totalValuation}</span>
              </div>
              <div className="loan-invoice-summary-row">
                <span>Profit / Loss</span>
                <span className={summary?.profitLossRaw >= 0 ? 'positive' : 'negative'}>
                  {summary?.profitLossSign}
                  {summary?.profitLoss}
                </span>
              </div>
            </>
          )}
          <div className="loan-invoice-summary-row total">
            <span>Total Payable Amount</span>
            <span>₹ {summary?.totalPayable}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="loan-invoice-footer">
        <p className="thanks">Thank you for your business.</p>
        <p>
          For queries, contact {firm?.email && firm.email !== '-' ? firm.email : 'your branch office'}
          {firm?.phone && firm.phone !== '-' ? ` | ${firm.phone}` : ''}
        </p>
        <p>Statement generated on {meta?.generatedOn || '-'}</p>
      </div>
    </div>
  );
};

export default LoanInvoiceTemplate;
