import React from 'react'
import { Routes, Route } from 'react-router-dom';
import AddAccount from '../../components/account/AddAccount';
import AccountList from '../../components/account/AccountList';

const AccountRoutes = () => {
  return (
    <div>
      <Routes>
        <Route path="/add" element={< AddAccount />} />
        <Route path="/list" element={< AccountList />} />
      </Routes>
    </div>
  )
}

export default AccountRoutes
