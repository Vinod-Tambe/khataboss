import React, { useState } from 'react';

const LoanStockLedgerLogicNote = () => {
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
            <strong>Report type:</strong> Daily <strong>loan stock</strong> ledger (secured and
            unsecured loans combined; one row per calendar day). <strong>GIRVI</strong> = number of
            loans in stock; <strong>AMOUNT</strong> = outstanding principal in stock.
          </p>
          <ul className="mb-2 ps-3">
            <li>
              <strong>Opening</strong> — stock at start of day (previous day&apos;s final; first day of
              period uses stock as on period start date).
            </li>
            <li>
              <strong>Received</strong> — new loans started that day (principal + 1 girvi each) plus{' '}
              <strong>additional principal</strong> on that day (amount only).
            </li>
            <li>
              <strong>Total</strong> — Opening + Received (same day, before releases).
            </li>
            <li>
              <strong>Released</strong> — principal out that day from <strong>loan release</strong>{' '}
              (+1 girvi per release) and <strong>deposits</strong> (principal only; partial deposit does
              not reduce girvi count).
            </li>
            <li>
              <strong>Final</strong> — Total − Released (closing stock for the day; next day opening).
            </li>
            <li>
              <strong>Interest</strong> — interest collected that day on releases and deposits (not added
              to stock amount).
            </li>
          </ul>
          <p className="mb-0 text-muted">
            Footer: opening = first day opening; received / released / interest = sums over the period;
            final = last day closing; total columns = period opening + total received (not a sum of daily
            total columns).
          </p>
        </div>
      )}
    </div>
  );
};

export default LoanStockLedgerLogicNote;
