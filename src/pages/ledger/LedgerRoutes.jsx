import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import LoanLedger from '../../components/ledger/LoanLedger';
import LoanItemLedger from '../../components/ledger/LoanItemLedger';

const LedgerRoutes = () => (
  <Routes>
    <Route path="/loan" element={<LoanLedger />} />
    <Route path="/loan-item" element={<LoanItemLedger />} />
    <Route path="*" element={<Navigate to="/ledger/loan" replace />} />
  </Routes>
);

export default LedgerRoutes;
