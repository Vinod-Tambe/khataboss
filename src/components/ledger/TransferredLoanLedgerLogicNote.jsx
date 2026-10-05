import React, { useState } from 'react';

const TransferredLoanLedgerLogicNote = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="loan-stock-ledger-logic mb-2">
      <button
        type="button"
        className="btn btn-link btn-sm loan-stock-ledger-logic__toggle p-0 text-decoration-none"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <i className={`bi bi-${open ? 'chevron-down' : 'chevron-right'} me-1`} aria-hidden="true" />
        How this report is calculated
      </button>
      {open && (
        <div className="loan-stock-ledger-logic__body small text-start mt-1 p-2 border rounded">
          <p className="mb-2">
            <strong>Report type:</strong> Daily ledger for loans <strong>transferred in</strong> to
            your firm (inter-firm or money-lender transfer). Same layout as loan stock: opening →
            transferred → total → released → final, plus interest on release/deposit.
          </p>
          <ul className="mb-0 ps-3">
            <li>
              <strong>Transferred GIRVI</strong> — new transfer-in loans on that date (transfer
              date = loan start date) plus additional principal on those loans.
            </li>
            <li>
              <strong>Released</strong> — principal released or deposited on transferred-in loans
              that day.
            </li>
            <li>Only loans with <strong>transferred in</strong> flag are included (not regular new loans).</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default TransferredLoanLedgerLogicNote;
