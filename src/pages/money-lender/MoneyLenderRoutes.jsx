import React from 'react'
import { Routes, Route } from 'react-router-dom';
import AddMoneyLender from '../../components/money-lender/AddMoneyLender';
import MoneyLenderList from '../../components/money-lender/MoneyLenderList';
import UpdateMoneyLender from '../../components/money-lender/UpdateMoneyLender';

const MoneyLenderRoutes = () => {
  return (
    <div>
      <Routes>
        <Route path="add" element={< AddMoneyLender />} />
        <Route path="list" element={< MoneyLenderList />} />
        <Route path="edit/:uuid" element={< UpdateMoneyLender />} />
      </Routes>
    </div>
  )
}

export default MoneyLenderRoutes;
