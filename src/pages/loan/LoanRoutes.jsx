import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ListLoan from '../../components/loan/ListLoan';
import AuctionLoanList from '../../components/loan/AuctionLoanList';

const LoanRoutes = () => (
  <Routes>
    <Route path="/all-list" element={<ListLoan status="ALL" global={true} />} />
    <Route path="/active-list" element={<ListLoan status="ACTIVE" global={true} />} />
    <Route path="/release-list" element={<ListLoan status="RELEASED" global={true} />} />
    <Route path="/auction-list" element={<AuctionLoanList global={true} />} />
    <Route path="/transfer-list" element={<ListLoan status="TRANSFERRED" global={true} />} />
  </Routes>
);

export default LoanRoutes;
