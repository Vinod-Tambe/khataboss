import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import ListLoan from '../../components/loan/ListLoan';
import AuctionLoanList from '../../components/loan/AuctionLoanList';
import { nestedRoutesProps } from '../../utils/moduleRouteUtils';

const LoanRoutes = () => {
  const location = useLocation();

  return (
    <Routes {...nestedRoutesProps(location)}>
      <Route path="all-list" element={<ListLoan status="ALL" global={true} />} />
      <Route path="active-list" element={<ListLoan status="ACTIVE" global={true} />} />
      <Route path="pending-interest-list" element={<ListLoan status="PENDING_INTEREST" global={true} />} />
      <Route path="today-pending-interest-list" element={<ListLoan status="TODAY_PENDING_INTEREST" global={true} />} />
      <Route path="release-list" element={<ListLoan status="RELEASED" global={true} />} />
      <Route path="auction-list" element={<AuctionLoanList global={true} />} />
      <Route path="transfer-list" element={<ListLoan status="TRANSFERRED" global={true} />} />
      <Route path="*" element={<Navigate to="/loan/active-list" replace />} />
    </Routes>
  );
};

export default LoanRoutes;
