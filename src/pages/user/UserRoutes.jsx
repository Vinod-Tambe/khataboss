import React from 'react'
import { Routes, Route } from 'react-router-dom';
import AddUser from '../../components/user/AddUser';
import UpdateUser from '../../components/user/UpdateUser';
import UserList from '../../components/user/UserList';
import UserGrid from '../../components/user/UserGrid';
import AuctionUserList from '../../components/user/AuctionUserList';
import AddLoan from '../../components/loan/AddLoan';
import UserHomeRoutes from './UserHomeRoutes';

const UserRoutes = () => {
  return (
    <div>
      <Routes>
        <Route path="/add" element={< AddUser />} />
        <Route path="/edit/:uuid" element={< UpdateUser />} />
        <Route path="/list" element={< UserList />} />
        <Route path="/auction-list" element={< AuctionUserList />} />
        <Route path="/home/*" element={< UserHomeRoutes />} />
        <Route path="/add-loan" element={< AddLoan />} />
        <Route path="/*" element={< UserGrid />} />
      </Routes>
    </div>
  )
}

export default UserRoutes
