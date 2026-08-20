import React from 'react'
import { Routes, Route } from 'react-router-dom';
import AddUser from '../../components/user/AddUser';
import UpdateUser from '../../components/user/UpdateUser';
import CustomerBrowse from '../../components/user/CustomerBrowse';
import AuctionUserList from '../../components/user/AuctionUserList';
import AddLoan from '../../components/loan/AddLoan';
import UserHomeRoutes from './UserHomeRoutes';
import PermissionRoute from '../../routes/PermissionRoute';

const UserRoutes = () => {
  return (
    <div>
      <Routes>
        <Route
          path="/add"
          element={
            <PermissionRoute permission="user.create">
              <AddUser />
            </PermissionRoute>
          }
        />
        <Route
          path="/edit/:uuid"
          element={
            <PermissionRoute permission="user.edit">
              <UpdateUser />
            </PermissionRoute>
          }
        />
        <Route path="/list" element={<PermissionRoute permission="user.view"><CustomerBrowse initialView="list" /></PermissionRoute>} />
        <Route path="/grid" element={<PermissionRoute permission="user.view"><CustomerBrowse initialView="grid" /></PermissionRoute>} />
        <Route path="/auction-list" element={<PermissionRoute permission="loan.auction"><AuctionUserList /></PermissionRoute>} />
        <Route path="/home/*" element={<UserHomeRoutes />} />
        <Route path="/add-loan" element={<PermissionRoute permission="loan.create"><AddLoan /></PermissionRoute>} />
        <Route path="/*" element={<PermissionRoute permission="user.view"><CustomerBrowse initialView="grid" /></PermissionRoute>} />
      </Routes>
    </div>
  )
}

export default UserRoutes
