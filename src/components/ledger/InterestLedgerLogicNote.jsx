import React, { useState } from 'react';

const InterestLedgerLogicNote = () => {
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
            Daily <strong>interest balance</strong> ledger: opening carries forward;{' '}
            <strong>final = opening + received − paid</strong>.
          </p>
          <p className="mb-1 fw-bold">Received interest includes:</p>
          <ul className="mb-2 ps-3">
            <li>Loan release interest, deposit interest, auction interest</li>
            <li>Prepaid first-month interest on new loans</li>
            <li>Finance loan interest collections (INTEREST payments)</li>
          </ul>
          <p className="mb-1 fw-bold">Interest paid includes:</p>
          <ul className="mb-0 ps-3">
            <li>Release discount (rel_disc_amt)</li>
            <li>Finance interest payment rollbacks</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default InterestLedgerLogicNote;
