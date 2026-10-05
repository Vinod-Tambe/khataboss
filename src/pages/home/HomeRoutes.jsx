import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import { nestedRoutesProps } from '../../utils/moduleRouteUtils';

const HomeRoutes = () => {
  const location = useLocation();

  return (
    <div>
      <Routes {...nestedRoutesProps(location)}>
        <Route path="*" element={<HomePage />} />
      </Routes>
    </div>
  );
};

export default HomeRoutes;
