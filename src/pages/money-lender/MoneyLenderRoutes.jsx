import React from 'react'
import { Routes, Route } from 'react-router-dom';
import AddMoneyLender from '../../components/money-lender/AddMoneyLender';
import MoneyLenderList from '../../components/money-lender/MoneyLenderList';
import UpdateMoneyLender from '../../components/money-lender/UpdateMoneyLender';
import PermissionRoute from '../../routes/PermissionRoute';

const MoneyLenderRoutes = () => {
  return (
    <div>
      <Routes>
        <Route path="add" element={<PermissionRoute permission="moneyLender.create"><AddMoneyLender /></PermissionRoute>} />
        <Route path="list" element={<PermissionRoute permission="moneyLender.view"><MoneyLenderList /></PermissionRoute>} />
        <Route path="edit/:uuid" element={<PermissionRoute permission="moneyLender.edit"><UpdateMoneyLender /></PermissionRoute>} />
      </Routes>
    </div>
  )
}

export default MoneyLenderRoutes;
