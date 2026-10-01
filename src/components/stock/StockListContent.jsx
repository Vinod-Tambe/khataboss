import React from 'react';
import LoanItemLedgerReport from '../ledger/LoanItemLedgerReport';

const StockListContent = ({
  rows = [],
  loading = false,
  errorMessage = null,
  onOpenStockDetails,
  onOpenLoanDetails,
}) => (
  <LoanItemLedgerReport
    rows={rows}
    loading={loading}
    errorMessage={errorMessage}
    onOpenStockDetails={onOpenStockDetails}
    onOpenLoanDetails={onOpenLoanDetails}
  />
);

export default StockListContent;
