import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ListFinance from '../../components/finance/ListFinance';

const FinanceRoutes = () => (
  <Routes>
    <Route path="/active-list" element={<ListFinance status="ACTIVE" />} />
    <Route path="/completed-list" element={<ListFinance status="COMPLETED" />} />
    <Route path="/close-list" element={<ListFinance status="CLOSED" />} />
    <Route path="/today-pending-emi" element={<ListFinance status="TODAY_PENDING_EMI" />} />
    <Route path="/all-list" element={<ListFinance status="ALL" />} />
  </Routes>
);

export default FinanceRoutes;

