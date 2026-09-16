import React from 'react';
import { Route, Routes } from 'react-router-dom';
import SupportTicketListPage from './SupportTicketListPage';
import SupportTicketDetailPage from './SupportTicketDetailPage';

const SupportRoutes = () => (
  <Routes>
    <Route index element={<SupportTicketListPage />} />
    <Route path=":uuid" element={<SupportTicketDetailPage />} />
  </Routes>
);

export default SupportRoutes;
