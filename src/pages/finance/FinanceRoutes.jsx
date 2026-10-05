import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import ListFinance from '../../components/finance/ListFinance';
import { nestedRoutesProps } from '../../utils/moduleRouteUtils';

const FinanceRoutes = () => {
  const location = useLocation();

  return (
    <Routes {...nestedRoutesProps(location)}>
      <Route path="active-list" element={<ListFinance status="ACTIVE" global={true} />} />
      <Route path="completed-list" element={<ListFinance status="COMPLETED" global={true} />} />
      <Route path="close-list" element={<ListFinance status="CLOSED" global={true} />} />
      <Route path="today-pending-emi" element={<ListFinance status="TODAY_PENDING_EMI" global={true} />} />
      <Route path="all-list" element={<ListFinance status="ALL" global={true} />} />
      <Route path="*" element={<Navigate to="/finance/active-list" replace />} />
    </Routes>
  );
};

export default FinanceRoutes;
