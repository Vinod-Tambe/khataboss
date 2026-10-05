import React from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import LoanLedger from '../../components/ledger/LoanLedger';
import LoanItemLedger from '../../components/ledger/LoanItemLedger';
import LoanStockLedger from '../../components/ledger/LoanStockLedger';
import TransferredLoanLedger from '../../components/ledger/TransferredLoanLedger';
import InterestLedger from '../../components/ledger/InterestLedger';
import { nestedRoutesProps } from '../../utils/moduleRouteUtils';

const LedgerRoutes = () => {
  const location = useLocation();

  return (
    <Routes {...nestedRoutesProps(location)}>
      <Route path="loan" element={<LoanLedger />} />
      <Route path="loan-item" element={<LoanItemLedger />} />
      <Route path="loan-stock" element={<LoanStockLedger />} />
      <Route path="transferred-loan" element={<TransferredLoanLedger />} />
      <Route path="interest" element={<InterestLedger />} />
      <Route path="*" element={<Navigate to="/ledger/loan" replace />} />
    </Routes>
  );
};

export default LedgerRoutes;
