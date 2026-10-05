import React from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import StockBrowse from '../../components/stock/StockBrowse';
import StockDetailsPage from '../../components/stock/StockDetailsPage';
import { nestedRoutesProps } from '../../utils/moduleRouteUtils';

const StockRoutes = () => {
  const location = useLocation();

  return (
    <Routes {...nestedRoutesProps(location)}>
      <Route index element={<Navigate to="grid" replace />} />
      <Route path="details/:uuid" element={<StockDetailsPage />} />
      <Route path="grid" element={<StockBrowse initialView="grid" />} />
      <Route path="list" element={<StockBrowse initialView="list" />} />
      <Route path="*" element={<Navigate to="/stock/grid" replace />} />
    </Routes>
  );
};

export default StockRoutes;
