import React from 'react';
import PrintPreviewModal from '../common/PrintPreviewModal';
import LoanLedgerStatement from './LoanLedgerStatement';

const LoanLedgerStatementModal = ({
  show,
  onHide,
  loading,
  loanDetails,
  customer,
  periodStart,
  periodEnd,
  firmName,
  onOpenLoanDetails,
}) => (
  <PrintPreviewModal
    show={show}
    onHide={onHide}
    title="Loan Ledger Statement"
    printAreaId="loan-ledger-statement-print"
  >
    {loading ? (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-2 mb-0">Loading loan ledger…</p>
      </div>
    ) : (
      <LoanLedgerStatement
        loanDetails={loanDetails}
        customer={customer}
        periodStart={periodStart}
        periodEnd={periodEnd}
        firmName={firmName}
        onOpenLoanDetails={onOpenLoanDetails}
      />
    )}
  </PrintPreviewModal>
);

export default LoanLedgerStatementModal;
