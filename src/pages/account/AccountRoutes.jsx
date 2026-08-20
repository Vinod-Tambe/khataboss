import React from 'react'
import { Routes, Route } from 'react-router-dom';
import AddAccount from '../../components/account/AddAccount';
import AccountList from '../../components/account/AccountList';
import UpdateAccount from '../../components/account/UpdateAccount';
import AccountDetails from '../../components/account/AccountDetails';
import PermissionRoute from '../../routes/PermissionRoute';

const AccountRoutes = () => {
  return (
    <div>
      <Routes>
        <Route path="/add" element={<PermissionRoute permission="account.create"><AddAccount /></PermissionRoute>} />
        <Route path="/list" element={<PermissionRoute permission="account.view"><AccountList /></PermissionRoute>} />
        <Route path="/edit/:uuid" element={<PermissionRoute permission="account.edit"><UpdateAccount /></PermissionRoute>} />
        <Route path="/details/:uuid" element={<PermissionRoute permission="account.view"><AccountDetails /></PermissionRoute>} />
      </Routes>
    </div>
  )
}

export default AccountRoutes
