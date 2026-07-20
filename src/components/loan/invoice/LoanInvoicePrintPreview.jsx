import React, { useMemo } from 'react';
import PrintPreviewModal from '../../common/PrintPreviewModal';
import LoanInvoiceTemplate from './LoanInvoiceTemplate';
import { buildLoanInvoiceData } from './buildLoanInvoiceData';

/**
 * Print preview modal for loan invoice.
 * Reusable: pass loanDetails + optional customer.
 */
const LoanInvoicePrintPreview = ({ show, onHide, loanDetails, customer }) => {
  const invoiceData = useMemo(
    () => (show && loanDetails ? buildLoanInvoiceData(loanDetails, customer) : null),
    [show, loanDetails, customer]
  );

  return (
    <PrintPreviewModal
      show={show}
      onHide={onHide}
      title="Loan Invoice — Print Preview"
      printAreaId="loan-invoice-print-area"
    >
      <LoanInvoiceTemplate data={invoiceData} />
    </PrintPreviewModal>
  );
};

export default LoanInvoicePrintPreview;
