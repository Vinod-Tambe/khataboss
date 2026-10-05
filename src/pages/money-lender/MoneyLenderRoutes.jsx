import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import AddMoneyLender from '../../components/money-lender/AddMoneyLender';
import MoneyLenderList from '../../components/money-lender/MoneyLenderList';
import UpdateMoneyLender from '../../components/money-lender/UpdateMoneyLender';
import PermissionRoute from '../../routes/PermissionRoute';
import { nestedRoutesProps } from '../../utils/moduleRouteUtils';

const MoneyLenderRoutes = () => {
  const location = useLocation();

  return (
    <div>
      <Routes {...nestedRoutesProps(location)}>
        <Route path="add" element={<PermissionRoute permission="moneyLender.create"><AddMoneyLender /></PermissionRoute>} />
        <Route path="list" element={<PermissionRoute permission="moneyLender.view"><MoneyLenderList /></PermissionRoute>} />
        <Route path="edit/:uuid" element={<PermissionRoute permission="moneyLender.edit"><UpdateMoneyLender /></PermissionRoute>} />
        <Route path="*" element={<Navigate to="/money-lender/list" replace />} />
      </Routes>
    </div>
  );
};

export default MoneyLenderRoutes;
